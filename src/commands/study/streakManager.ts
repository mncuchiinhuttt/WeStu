import { EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySessionModel';
import { StudyGoalTarget } from '../../models/StudyGoalTarget';
import { LanguageService } from '../../utils/LanguageService';

let strings: any;

export async function manageStreak(interaction: any) {
  try {
    const languageService = LanguageService.getInstance();
    const userLang = await languageService.getUserLanguage(interaction.user.id);
    const langStrings = require(`../../data/languages/${userLang}.json`);
    strings = langStrings.commands.study.streak;

    const userId = interaction.user.id;
    const period = parseInt(interaction.options.getString('period') ?? '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [studySessions, goals] = await Promise.all([
      TimeStudySession.find({
        userId,
        finishTime: { $exists: true },
        beginTime: { $gte: startDate }
      }).sort({ beginTime: 1 }),
      StudyGoalTarget.find({
        userId,
        lastStudyDate: { $gte: startDate }
      })
    ]);

    const streakStats = calculateCombinedStreakStats(studySessions, goals);
    const achievements = checkAchievements(streakStats);

    const embed = new EmbedBuilder()
      .setTitle(strings.title.replace('{period}', period))
      .setColor('#ff6b6b')
      .addFields([
        {
          name: strings.currentStreak,
          value: strings.daysValue.replace('{days}', streakStats.currentStreak),
          inline: true
        },
        {
          name: strings.longestStreak,
          value: strings.daysValue.replace('{days}', streakStats.longestStreak),
          inline: true
        },
        {
          name: strings.studySessions,
          value: strings.sessionsValue.replace('{count}', studySessions.length),
          inline: true
        },
        {
          name: strings.goalsInProgress,
          value: strings.goalsValue.replace('{count}', goals.filter(g => g.status === 'in_progress').length),
          inline: true
        },
        {
          name: strings.totalStudyDays,
          value: strings.daysValue.replace('{days}', streakStats.totalDays),
          inline: true
        },
        {
          name: strings.averageHours,
          value: strings.hoursValue.replace('{hours}', streakStats.averageHours.toFixed(1)),
          inline: true
        }
      ]);

    const calendar = period === 30 ? 
    generateStreakCalendar(streakStats.history) :
    generateLongStreakCalendar(streakStats.history);

    embed.addFields({
      name: strings.calendar.title.replace('{period}', period),
      value: calendar
    });

    if (achievements.length > 0) {
      embed.addFields({
        name: strings.achievements.title,
        value: achievements.map(a => `**${a.name}**\n${a.description}`).join('\n\n')
      });
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: strings.error,
      ephemeral: true
    });
  }
}

// src/commands/study/streakManager.ts

function generateLongStreakCalendar(history: any) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const calendar: string[] = [];
  const today = new Date();
  let currentMonth = '';

  // Add color legend
  calendar.push('Study Hours: ⬜ 0h 🟨 <2h 🟧 <4h 🟥 4h+\n');

  // Generate 6 months of calendar
  for (let i = 179; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const month = months[date.getMonth()];
    const dateStr = date.toISOString().split('T')[0];
    const hours = history[dateStr] || 0;

    // Add month header when month changes
    if (month !== currentMonth) {
      if (calendar.length > 1) calendar.push('\n');
      calendar.push(`\n${month}:\n`);
      currentMonth = month;
    }

    // Add week separator
    if (date.getDay() === 0 && i !== 179) {
      calendar.push(' | ');
    }

    // Add study indicator
    const emoji = hours === 0 ? '⬜' : 
                 hours < 2 ? '🟨' :
                 hours < 4 ? '🟧' : '🟥';
    
    calendar.push(emoji);

    // Add day count every 7 days
    if (date.getDay() === 6) {
      calendar.push(` W${Math.floor(i / 7 + 1)}`);
    }
  }

  return calendar.join('');
}

function calculateCombinedStreakStats(sessions: any[], goals: any[]) {
  const today = new Date();
  const dailyStudy: { [key: string]: number } = {};

  // Add time from study sessions
  sessions.forEach(session => {
    const date = session.beginTime.toISOString().split('T')[0];
    const hours = (session.duration || 0) / 3600; // Convert seconds to hours
    dailyStudy[date] = (dailyStudy[date] || 0) + hours;
  });

  // Add time from goals
  goals.forEach(goal => {
    if (goal.lastStudyDate) {
      const date = goal.lastStudyDate.toISOString().split('T')[0];
      const hours = goal.currentHours || 0;
      dailyStudy[date] = (dailyStudy[date] || 0) + hours;
    }
  });

  const dates = Object.keys(dailyStudy).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  for (let i = 0; i < dates.length; i++) {
    const curr = new Date(dates[i]);
    const prev = i > 0 ? new Date(dates[i-1]) : null;
    
    if (prev) {
      const dayDiff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    
    longestStreak = Math.max(longestStreak, streak);
    if (i === dates.length - 1) {
      const daysSinceLastStudy = (today.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      currentStreak = daysSinceLastStudy <= 1 ? streak : 0;
    }
  }

  const totalHours = Object.values(dailyStudy).reduce((sum, hours) => sum + hours, 0);

  return {
    currentStreak,
    longestStreak,
    totalDays: dates.length,
    averageHours: dates.length > 0 ? totalHours / dates.length : 0,
    history: dailyStudy
  };
}

// generateStreakCalendar and checkAchievements functions remain unchanged

function generateStreakCalendar(history: any) {
  const days = [
    strings.calendar.days.sun,
    strings.calendar.days.mon,
    strings.calendar.days.tue,
    strings.calendar.days.wed,
    strings.calendar.days.thu,
    strings.calendar.days.fri,
    strings.calendar.days.sat
  ];
  const calendar: string[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const hours = history[dateStr] || 0;
    
    const emoji = hours === 0 ? '⬜' : 
                 hours < 2 ? '🟨' :
                 hours < 4 ? '🟧' : '🟥';
                 
    calendar.push(emoji);
    
    if (calendar.length % 7 === 0) calendar.push('\n');
  }
  
  return `${days.join(' ')}\n${calendar.join(' ')}`;
}

function checkAchievements(stats: any) {
  const achievements = [];
  
  if (stats.currentStreak >= 7) {
    achievements.push({
      name: strings.achievements.weekWarrior.name,
      description: strings.achievements.weekWarrior.description
    });
  }
  
  if (stats.longestStreak >= 30) {
    achievements.push({
      name: strings.achievements.monthlyMaster.name,
      description: strings.achievements.monthlyMaster.description
    });
  }
  
  if (stats.totalDays >= 100) {
    achievements.push({
      name: strings.achievements.centuryClub.name,
      description: strings.achievements.centuryClub.description
    });
  }
  
  return achievements;
}
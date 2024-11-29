import { CommandInteraction, EmbedBuilder } from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySessionModel";
import { StudyTarget } from "../../models/StudyTargetModel";
import { LanguageService } from '../../utils/LanguageService';

let strings: any;

export async function reviewStudy(interaction: any) {
  try {
    const languageService = LanguageService.getInstance();
    const userLang = await languageService.getUserLanguage(interaction.user.id);
    const langStrings = require(`../../data/languages/${userLang}.json`);
    strings = langStrings.commands.study.review;

    if (!interaction?.user?.id) {
      throw new Error('Invalid interaction object');
    }

    const userId = interaction.user.id;
    const period = parseInt(interaction.options.getString('period') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const sessions = await TimeStudySession.find({
      userId,
      beginTime: { $gte: startDate }
    }).sort({ beginTime: 1 });

    const userTarget = await StudyTarget.findOne({ userId });

    const metrics = calculateMetrics(sessions, period);
    const analysis = analyzeStudyPattern(sessions, metrics);
    const recommendations = generateRecommendations(metrics, analysis, userTarget);
    
    const embed = createReviewEmbed(metrics, analysis, recommendations, userTarget, period);

    if (!interaction.replied) {
      await interaction.reply({ 
        embeds: [embed], 
        ephemeral: true 
      });
    }

  } catch (error) {
    console.error('Error in reviewStudy:', error);
    if (interaction?.reply && !interaction.replied) {
      await interaction.reply({
        content: strings.error,
        ephemeral: true
      });
    }
  }
}

interface Metrics {
	totalDays: number;
	totalHours: number;
	averageHoursPerDay: number;
	daysStudied: number;
	consistency: number;
	varianceScore: number;
	longestStreak: number;
	shortestSession: number;
	longestSession: number;
}

interface DailySessions {
  [date: string]: any[];
}

function calculateMetrics(sessions: any[], period: number): Metrics {
	const dailySessions = groupSessionsByDay(sessions);

	const dailyHours: number[] = Object.values(dailySessions as DailySessions).map(day => 
		day.reduce((sum, session) => sum + (session.duration || 0) / 3600, 0)
	);

	const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0);
	const daysStudied = dailyHours.filter(hours => hours > 0).length;

	return {
		totalDays: period,
		totalHours: totalHours,
		averageHoursPerDay: totalHours / period,
		daysStudied: daysStudied,
		consistency: (daysStudied / period) * 100,
		varianceScore: calculateVariance(dailyHours),
		longestStreak: calculateLongestStreak(dailyHours),
		shortestSession: Math.min(...sessions.map(s => (s.duration || 0) / 3600)),
		longestSession: Math.max(...sessions.map(s => (s.duration || 0) / 3600))
	};
}

function analyzeStudyPattern(sessions: any[], metrics: Metrics) {
	const trend = calculateTrend(sessions);
	const timeOfDay = analyzeTimeOfDay(sessions);
	
	return {
		trend,
		timeOfDay,
		effectiveTime: determineEffectiveTime(sessions),
		consistencyGrade: getConsistencyGrade(metrics.consistency),
		varianceGrade: getVarianceGrade(metrics.varianceScore)
	};
}

function generateRecommendations(metrics: Metrics, analysis: any, target: any) {
	const recommendations = [];

	if (!target) {
		if (metrics.averageHoursPerDay < 1) {
			recommendations.push("Consider setting a study target of at least 1 hour per day");
		}
		if (metrics.daysStudied < 7) {
			recommendations.push("Try to study every day for better consistency");
		}
	} else {
		const weeklyTargetHours = target.weeklyTarget;
		const currentWeeklyHours = metrics.totalHours;
		
		if (currentWeeklyHours < weeklyTargetHours) {
			recommendations.push(`You're ${(weeklyTargetHours - currentWeeklyHours).toFixed(1)} hours behind your weekly target`);
		} else if (currentWeeklyHours > weeklyTargetHours * 1.5) {
			recommendations.push("Consider increasing your weekly target");
		}
	}

	if (metrics.varianceScore > 0.5) {
		recommendations.push("Try to maintain more consistent study duration each day");
	}

	if (metrics.consistency < 70) {
		recommendations.push("Work on studying more regularly");
	}

	return recommendations;
}

function createReviewEmbed(metrics: Metrics, analysis: any, recommendations: string[], target: any, period: number) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(strings.title)
    .setDescription(strings.description.replace('{period}', period))
    .addFields(
      { name: strings.metrics.title, value: 
        strings.metrics.total.replace('{hours}', metrics.totalHours.toFixed(1)) + '\n' +
        strings.metrics.daysStudied.replace('{days}', metrics.daysStudied).replace('{total}', period) + '\n' +
        strings.metrics.average.replace('{hours}', metrics.averageHoursPerDay.toFixed(1)) + '\n' +
        strings.metrics.consistency.replace('{score}', metrics.consistency.toFixed(1))
      },
      { name: strings.analysis.title, value:
        strings.analysis.trend.replace('{trend}', analysis.trend) + '\n' +
        strings.analysis.bestTime.replace('{time}', analysis.timeOfDay) + '\n' +
        strings.analysis.consistencyGrade.replace('{grade}', analysis.consistencyGrade) + '\n' +
        strings.analysis.varianceGrade.replace('{grade}', analysis.varianceGrade)
      },
      { name: strings.recommendations.title, value: recommendations.join('\n') || strings.recommendations.default }
    );

  if (target) {
    embed.addFields({
      name: strings.target.title,
      value: strings.target.weekly.replace('{hours}', target.weeklyTarget) + '\n' +
             strings.target.daily.replace('{hours}', target.dailyMinimum) + '\n' +
             strings.target.progress.replace('{progress}', ((metrics.totalHours / target.weeklyTarget) * 100).toFixed(1))
    });
  }

  return embed;
}

// Helper functions
function groupSessionsByDay(sessions: any[]) {
	return sessions.reduce((acc, session) => {
		const day = session.beginTime.toISOString().split('T')[0];
		acc[day] = acc[day] || [];
		acc[day].push(session);
		return acc;
	}, {});
}

function calculateVariance(hours: number[]): number {
	const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
	const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
	return Math.sqrt(variance);
}

function calculateLongestStreak(dailyHours: number[]): number {
	let currentStreak = 0;
	let maxStreak = 0;
	
	for (const hours of dailyHours) {
		if (hours > 0) {
			currentStreak++;
			maxStreak = Math.max(maxStreak, currentStreak);
		} else {
			currentStreak = 0;
		}
	}
	
	return maxStreak;
}

function calculateTrend(sessions: any[]): string {
	// Simple linear trend analysis
	const dailyHours = groupSessionsByDay(sessions);
	interface Session {
		beginTime: Date;
		duration?: number;
	}

	interface DailySessions {
		[date: string]: Session[];
	}
	
	const trend = Object.values(dailyHours as DailySessions).map(day => 
		day.reduce((sum, session) => sum + (session.duration || 0) / 3600, 0)
	);
	
	const firstHalf = trend.slice(0, 3).reduce((sum, h) => sum + h, 0);
	const secondHalf = trend.slice(-3).reduce((sum, h) => sum + h, 0);
	
	if (secondHalf > firstHalf * 1.2) return strings.trends.improving;
	if (secondHalf < firstHalf * 0.8) return strings.trends.declining;
	return strings.trends.stable;
}

function analyzeTimeOfDay(sessions: any[]): string {
	const timeSlots = {
		morning: 0,   // 5-12
		afternoon: 0, // 12-17
		evening: 0,   // 17-22
		night: 0      // 22-5
	};
	
	sessions.forEach(session => {
		const hour = new Date(session.beginTime).getHours();
		if (hour >= 5 && hour < 12) timeSlots.morning++;
		else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
		else if (hour >= 17 && hour < 22) timeSlots.evening++;
		else timeSlots.night++;
	});
	
	const bestTime = Object.entries(timeSlots).reduce((a, b) => a[1] > b[1] ? a : b)[0];
	return bestTime.charAt(0).toUpperCase() + bestTime.slice(1);
}

function getConsistencyGrade(score: number): string {
	if (score >= 90) return "A+";
	if (score >= 80) return "A";
	if (score >= 70) return "B";
	if (score >= 60) return "C";
	return "D";
}

function getVarianceGrade(variance: number): string {
	if (variance <= 0.2) return "A+";
	if (variance <= 0.4) return "A";
	if (variance <= 0.6) return "B";
	if (variance <= 0.8) return "C";
	return "D";
}

function determineEffectiveTime(sessions: any[]): string {
	const timeSlots = {
		morning: 0,   // 5-12
		afternoon: 0, // 12-17
		evening: 0,   // 17-22
		night: 0      // 22-5
	};

	sessions.forEach(session => {
		const hour = new Date(session.beginTime).getHours();
		const duration = (session.duration || 0) / 3600; // convert duration to hours
		if (hour >= 5 && hour < 12) timeSlots.morning += duration;
		else if (hour >= 12 && hour < 17) timeSlots.afternoon += duration;
		else if (hour >= 17 && hour < 22) timeSlots.evening += duration;
		else timeSlots.night += duration;
	});

	const effectiveTime = Object.entries(timeSlots).reduce((a, b) => a[1] > b[1] ? a : b)[0];
	return effectiveTime.charAt(0).toUpperCase() + effectiveTime.slice(1);
}
import { Achievement, IAchievement } from '../../models/AchievementModel';
import { TimeStudySession } from '../../models/TimeStudySessionModel';
import { UserStreak } from '../../models/UserStreakModel';
import { achievementsList, AchievementCriteria } from '../../data/achievementsList';
import { Client } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function checkAndAwardAchievements(userId: string, client: Client) {
  // Calculate total study duration
  const aggregation = await TimeStudySession.aggregate([
    { $match: { userId: userId, finishTime: { $exists: true } } },
    {
      $group: {
        _id: '$userId',
        totalDuration: { $sum: '$duration' },
      },
    },
  ]);

  const totalDuration = aggregation[0]?.totalDuration || 0;

  // Get user's current streak
  const streakDoc = await UserStreak.findOne({ userId: userId });
  const currentStreak = streakDoc?.currentStreak || 0;

  // Fetch user's already earned achievements
  const userAchievements = await Achievement.find({ userId: userId }).select('name').lean();
  const earnedAchievements = userAchievements.map((ach) => ach.name);

  // Fetch all completed sessions
  const sessions = await TimeStudySession.find({ userId: userId, finishTime: { $exists: true } }).lean();

  // Iterate through all achievements
  for (const achievement of achievementsList) {
    if (earnedAchievements.includes(achievement.name)) continue;

    let criterionMet = false;

    if (achievement.name === 'Early Bird') {
      criterionMet = sessions.some((session) => {
        const hour = session.beginTime ? new Date(session.beginTime).getHours() : -1;
        return hour < 6;
      });
    } else if (achievement.name === 'Night Owl') {
      criterionMet = sessions.some((session) => {
        const hour = session.beginTime ? new Date(session.beginTime).getHours() : -1;
        return hour >= 22;
      });
    } else if (achievement.name === 'Focused') {
      criterionMet = sessions.some((session) => session.duration >= 14400 && !session.hasBreak); // 4 hours
    } else {
      // For achievements that don't require specific session data
      criterionMet = achievement.check(totalDuration, currentStreak, sessions);
    }

    if (criterionMet) {
      // Award achievement
      await Achievement.create({
        userId: userId,
        name: achievement.name,
      });

      // Notify user
      const user = await client.users.fetch(userId).catch(() => null);

      const languageService = LanguageService.getInstance();
      const userLang = await languageService.getUserLanguage(userId);
      const langStrings = require(`../../data/languages/${userLang}.json`);
      const strings = langStrings.commands.study.achievementService;

      if (user) {
        await user.send(`🎉 Congratulations! You have earned the **${achievement.name}** achievement: ${achievement.description}`);
        await user.send(
          strings.earned
          .replace('{name}', achievement.name)
          .replace('{description}', achievement.description)
        );
      }
    }
  }
}
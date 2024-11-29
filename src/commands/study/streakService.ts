import { UserStreak } from '../../models/UserStreakModel';
import { Client } from 'discord.js';
import moment from 'moment-timezone';

export async function updateUserStreak(userId: string, client: Client) {
  const today = moment().tz('Asia/Bangkok').startOf('day');
  const streakDoc = await UserStreak.findOne({ userId: userId });

  if (!streakDoc) {
    await UserStreak.create({
      userId: userId,
      currentStreak: 1,
      lastStudied: new Date(),
      longestStreak: 1,
    });
    return;
  }

  const lastStudied = moment(streakDoc.lastStudied).tz('Asia/Bangkok').startOf('day');
  const difference = today.diff(lastStudied, 'days');

  if (difference === 1) {
    streakDoc.currentStreak += 1;
  } else if (difference > 1) {
    streakDoc.currentStreak = 1;
  } else {
    // If studying multiple times a day, do not increment the streak again
    // or handle accordingly
  }

  if (streakDoc.currentStreak > streakDoc.longestStreak) {
    streakDoc.longestStreak = streakDoc.currentStreak;
  }

  streakDoc.lastStudied = new Date();
  await streakDoc.save();
}
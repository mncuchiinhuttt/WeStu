import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';
import moment from 'moment-timezone';
import { LanguageService } from '../../utils/LanguageService';

export async function dailyStudySummary(interaction: CommandInteraction) {
  const userId = interaction.user.id;
  const startOfDay = moment().tz('Asia/Bangkok').startOf('day').toDate();
  const endOfDay = moment().tz('Asia/Bangkok').endOf('day').toDate();

  const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(userId);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.study.dailySummary;

  const sessions = await TimeStudySession.find({
    userId: userId,
    finishTime: { $exists: true },
    beginTime: { $gte: startOfDay, $lte: endOfDay },
  });

  if (sessions.length === 0) {
    await interaction.reply({
      content: strings.notFound,
      ephemeral: true,
    });
    return;
  }

  let totalSeconds = 0;
  let description = '';

  sessions.forEach((session, index) => {
    const start = moment(session.beginTime).tz('Asia/Bangkok').format('HH:mm');
    const finish = moment(session.finishTime).tz('Asia/Bangkok').format('HH:mm');
    const duration = session.duration;
    totalSeconds += duration ?? 0;
    const durationFormatted = `${Math.floor((duration ?? 0) / 3600)}h ${Math.floor(((duration ?? 0) % 3600) / 60)}m`;
    description += `${index + 1}. **${start} - ${finish}** | ${durationFormatted}\n`;
  });

  const totalDuration = `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`;

  const embed = new EmbedBuilder()
    .setTitle(strings.title)
    .addFields(
      { name: strings.date, value: moment().tz('Asia/Bangkok').format('YYYY-MM-DD'), inline: true },
      { name: strings.totalStudyTime, value: totalDuration, inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: strings.sessions, value: description },
    )
    .setColor('#1E90FF')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
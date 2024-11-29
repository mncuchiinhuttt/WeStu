import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySessionModel';
import config from "../../config.json";
import moment from 'moment-timezone';

export async function addVirtualSession(interaction: any) {
  // Check if the user has admin permissions
	if (!config.developers.includes(interaction.user.id)) {
		const embed = new EmbedBuilder()
				.setTitle('Permission Denied')
				.setDescription('You do not have permission to use this command.')
				.setColor('#ff0000');

		await interaction.reply({
				embeds: [embed],
				ephemeral: true,
		});
		return;
	}

  const user = interaction.options.getUser('user', true);
  const topic = interaction.options.getString('topic', true);
  const beginTimeInput = interaction.options.getString('begin_time', true);
  const finishTimeInput = interaction.options.getString('finish_time', true);

  const beginTime = new Date(beginTimeInput);
  const finishTime = new Date(finishTimeInput);

  if (isNaN(beginTime.getTime()) || isNaN(finishTime.getTime())) {
    const embed = new EmbedBuilder()
      .setTitle('Invalid Time Format')
      .setDescription('Please use the format `YYYY-MM-DD HH:MM` for both begin and finish times.')
      .setColor('#ff0000');

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  if (beginTime.getTime() >= finishTime.getTime()) {
    const embed = new EmbedBuilder()
      .setTitle('Invalid Time Range')
      .setDescription('Begin time must be before finish time.')
      .setColor('#ff0000');

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  // Create the virtual study session
	const duration = Math.floor((finishTime.getTime() - beginTime.getTime()) / 1000);
  const newSession = await TimeStudySession.create({
    userId: user.id,
    topic: topic,
    beginTime: beginTime,
    finishTime: finishTime,
		duration: duration,
    scheduledStartNotified: true, // Since it's manually added
  });

  const embed = new EmbedBuilder()
    .setTitle('Virtual Study Session Added')
    .setDescription(`✅ Virtual study session for **${user.tag}** on **${topic}** scheduled from **${moment(beginTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')}** to **${moment(finishTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')}** (UTC+7).`)
    .setColor('#00ff00');

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}
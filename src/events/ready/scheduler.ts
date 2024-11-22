import { 
	Client, 
	MessageComponentInteraction, 
	ButtonBuilder, 
	ButtonStyle, 
	ActionRowBuilder, 
	ComponentType, 
	EmbedBuilder 
} from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';
import moment from 'moment-timezone';
import { updateUserStreak } from '../../commands/study/streakService';
import { checkAndAwardAchievements } from '../../commands/study/achievementService';

export default async (client: Client) => {
	console.log('Scheduler initialized');
	await startScheduler(client);

	setInterval(async () => {
		await startScheduler(client);
	}, 60 * 1000);
}

async function startScheduler(client: Client) {
	const now = new Date();

	// Find sessions where scheduledTime <= now and not yet notified or missed
	const sessionsToNotify = await TimeStudySession.find({
		scheduledTime: { $lte: now },
		scheduledStartNotified: false,
		missed: false,
	});

	for (const session of sessionsToNotify) {
		try {
			const user = await client.users.fetch(session.userId);
			if (!user) continue;

			// Send DM with start button
			const startButton = new ButtonBuilder()
				.setCustomId(`start-scheduled-study-${session._id}`)
				.setLabel('Start Study Session')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startButton);

			const embed = new EmbedBuilder()
				.setTitle('Scheduled Study Session')
				.setDescription(`⏰ Your scheduled study session is starting now (${moment(session.scheduledTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')} UTC+7). Click the button below to start your session.`)
				.setColor(0x00FF00);

			const dm = await user.send({
				embeds: [embed],
				components: [row],
			});

			// Update the session to indicate that notification has been sent
			session.scheduledStartNotified = true;
			await session.save();

			// Create collector for button interaction
			const collector = dm.createMessageComponentCollector({
				filter: (i: any) => i.customId === `start-scheduled-study-${session._id}` && i.user.id === session.userId,
				componentType: ComponentType.Button,
				time: 15 * 60 * 1000, // 15 minutes
			});

			collector.on('collect', async (i: MessageComponentInteraction) => {
				if (i.customId === `start-scheduled-study-${session._id}`) {
					// Start the study session
					session.beginTime = new Date();
					await session.save();

					// Update the button to a finish button
					const finishButton = new ButtonBuilder()
						.setCustomId(`finish-study-${session._id}`)
						.setLabel('Finish Study Session')
						.setStyle(ButtonStyle.Primary);

					const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(finishButton);

					const newEmbed = new EmbedBuilder()
						.setTitle('Study Session Started')
						.setDescription('📝 Study session started! Click the button below when you\'re done.')
						.setColor(0x0000FF);

					await i.update({
						embeds: [newEmbed],
						components: [newRow],
					});

					// Handle finish button
					const finishCollector = dm.channel?.createMessageComponentCollector({
						filter: (i: any) => i.customId === `finish-study-${session._id}` && i.user.id === session.userId,
						componentType: ComponentType.Button,
						time: 24 * 60 * 60 * 1000, 
					});

					finishCollector?.on('collect', async (i: MessageComponentInteraction) => {
						if (i.customId === `finish-study-${session._id}`) {
							await finishStudySession(i, session);
							finishCollector.stop();
						}
					});

					finishCollector?.on('end', async (collected: any) => {
						if (collected.size === 0 && !session.finishTime) {
							const timeoutEmbed = new EmbedBuilder()
								.setTitle('Study Session Timed Out')
								.setDescription('⏰ Study session timed out. Please start a new session.')
								.setColor(0xFF0000);

							await dm.edit({
								embeds: [timeoutEmbed],
								components: [],
							});
							// Optionally, mark the session as timed out or remove it
							await TimeStudySession.findByIdAndDelete(session._id);
						}
					});

					collector.stop();
				}
			});

			collector.on('end', async (collected: any) => {
				if (collected.size === 0 && !session.beginTime) {
					// User did not respond within 15 minutes
					// Mark the session as missed
					session.missed = true;
					await session.save();

					const missedEmbed = new EmbedBuilder()
						.setTitle('Missed Study Session')
						.setDescription('⚠️ You missed your scheduled study session.')
						.setColor(0xFF0000);

					await user.send({ embeds: [missedEmbed] });
				}
			});

		} catch (err) {
			console.error('Error sending scheduled session notification:', err);
		}
	}
}

async function finishStudySession(interaction: MessageComponentInteraction, session: any) {
  const beginTime = session.beginTime ?? session.scheduledTime;
  const finishTime = new Date();
  const duration = Math.floor((finishTime.getTime() - session.beginTime.getTime()) / 1000);

  await TimeStudySession.findByIdAndUpdate(session._id, {
    beginTime,
    finishTime,
    duration,
  });

  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  const embed = new EmbedBuilder()
  .setTitle('✅ Study Session Completed')
  .setDescription(`You studied for **${hours}h ${minutes}m ${seconds}s**. Great job! 🎉`)
  .setColor('#00ff00')
  .setTimestamp();
  
  await interaction.update({
	  embeds: [embed],
	  components: [],
	});
	
	await updateUserStreak(session.userId, interaction.client);
	await checkAndAwardAchievements(session.userId, interaction.client);
	
  // Send a follow-up motivational message
  try {
    const user = await interaction.user.fetch();
    await user.send('🙌 Keep up the fantastic work! Consistency is key to achieving your goals.');
  } catch (error) {
    console.error('Error sending motivational message:', error);
  }
}
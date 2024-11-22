import { 
	Client, 
	MessageComponentInteraction, 
	ButtonBuilder, 
	ButtonStyle, 
	ActionRowBuilder, 
	ComponentType 
} from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';
import moment from 'moment-timezone';

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

			const dm = await user.send({
				content: `⏰ Your scheduled study session is starting now (${moment(session.scheduledTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')} UTC+7). Click the button below to start your session.`,
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

					await i.update({
						content: '📝 Study session started! Click the button below when you\'re done.',
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
							await dm.edit({
								content: '⏰ Study session timed out. Please start a new session.',
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

					await user.send('⚠️ You missed your scheduled study session.');
				}
			});

		} catch (err) {
			console.error('Error sending scheduled session notification:', err);
		}
	}
}

async function finishStudySession(interaction: MessageComponentInteraction, session: any) {
  const finishTime = new Date();
  const duration = Math.floor((finishTime.getTime() - session.beginTime.getTime()) / 1000);

  session.finishTime = finishTime;
  session.duration = duration;
  await session.save();

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  await interaction.update({
    content: `✅ Study session finished! You studied for ${hours}h ${minutes}m ${seconds}s.`,
    components: [],
  });
}
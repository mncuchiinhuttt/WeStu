import { 
	Client, 
	MessageComponentInteraction, 
	ButtonBuilder, 
	ButtonStyle, 
	ActionRowBuilder, 
	ComponentType, 
	EmbedBuilder 
} from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySessionModel';
import moment from 'moment-timezone';
import { updateUserStreak } from '../../commands/study/streakService';
import { checkAndAwardAchievements } from '../../commands/study/achievementService';
import { LanguageService } from '../../utils/LanguageService';

export default async (client: Client) => {
	console.log('Scheduler initialized');
	await startScheduler(client);

	setInterval(async () => {
		await startScheduler(client);
	}, 60 * 1000);
}

async function startScheduler(client: Client) {
	const now = new Date();

	const sessionsToNotify = await TimeStudySession.find({
		scheduledTime: { $lte: now },
		scheduledStartNotified: false,
		missed: false,
	});

	for (const session of sessionsToNotify) {
		try {
			const user = await client.users.fetch(session.userId);
			if (!user) continue;

			const languageService = LanguageService.getInstance();
			const userLang = await languageService.getUserLanguage(session.userId);
			const langStrings = require(`../../data/languages/${userLang}.json`);
			const strings = langStrings.events.scheduler;

			const startButton = new ButtonBuilder()
				.setCustomId(`start-scheduled-study-${session._id}`)
				.setLabel(strings.startStudyButton)
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startButton);

			const embed = new EmbedBuilder()
				.setTitle(strings.scheduledStudySession.title)
				.setDescription(
					strings.scheduledStudySession.description
					.replace('{time}', moment(session.scheduledTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm'))
				)
				.setColor(0x00FF00);

			const dm = await user.send({
				embeds: [embed],
				components: [row],
			});

			session.scheduledStartNotified = true;
			await session.save();

			const collector = dm.createMessageComponentCollector({
				filter: (i: any) => i.customId === `start-scheduled-study-${session._id}` && i.user.id === session.userId,
				componentType: ComponentType.Button,
				time: 15 * 60 * 1000, 
			});

			collector.on('collect', async (i: MessageComponentInteraction) => {
				if (i.customId === `start-scheduled-study-${session._id}`) {
					session.beginTime = new Date();
					await session.save();

					const finishButton = new ButtonBuilder()
						.setCustomId(`finish-study-${session._id}`)
						.setLabel(strings.finishButton)
						.setStyle(ButtonStyle.Primary);

					const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(finishButton);

					const newEmbed = new EmbedBuilder()
						.setTitle(strings.studySessionStarted.title)
						.setDescription(strings.studySessionStarted.description)
						.setColor(0x0000FF);

					await i.update({
						embeds: [newEmbed],
						components: [newRow],
					});

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
								.setTitle(strings.studySessionTimeout.title)
								.setDescription(strings.studySessionTimeout.description)
								.setColor(0xFF0000);

							await dm.edit({
								embeds: [timeoutEmbed],
								components: [],
							});

							await TimeStudySession.findByIdAndDelete(session._id);
						}
					});

					collector.stop();
				}
			});

			collector.on('end', async (collected: any) => {
				if (collected.size === 0 && !session.beginTime) {
					session.missed = true;
					await session.save();

					const missedEmbed = new EmbedBuilder()
						.setTitle(strings.missedStudySession.title)
						.setDescription(strings.missedStudySession.description)
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

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.events.scheduler;
	
	const hours = Math.floor(duration / 3600);
	const minutes = Math.floor((duration % 3600) / 60);
	const seconds = duration % 60;
	
	const embed = new EmbedBuilder()
	.setTitle(strings.studySessionFinish.title)
	.setDescription(
		strings.studySessionFinish.description
		.replace('{hours}', hours.toString())
		.replace('{minutes}', minutes.toString())
		.replace('{seconds}', seconds.toString())
	)
	.setColor('#00ff00')
	.setTimestamp();
	
	await interaction.update({
		embeds: [embed],
		components: [],
	});
	
	await updateUserStreak(session.userId, interaction.client);
	await checkAndAwardAchievements(session.userId, interaction.client);

	try {
		const user = await interaction.user.fetch();
		await user.send(strings.studySessionFinish.userSend);
	} catch (error) {
		console.error('Error sending motivational message:', error);
	}
}
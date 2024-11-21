import { 
	CommandInteraction, 
	ButtonBuilder, 
	ButtonStyle, 
	ActionRowBuilder,
	ComponentType
} from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySession";

export async function manageStudySession(interaction: CommandInteraction) {
	try {
		const userId = interaction.user.id;

		// Check for existing session
		const existingSession = await TimeStudySession.findOne({
			userId: userId,
			finishTime: { $exists: false },
			duration: { $exists: false }
		});

		if (existingSession) {
			await interaction.reply({
				content: "You already have an active study session!",
				ephemeral: true
			});
			return;
		}

		// Create finish button
		const finishButton = new ButtonBuilder()
			.setCustomId('finish-study')
			.setLabel('Finish Study Session')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(finishButton);

		// Start new session
		const newSession = await TimeStudySession.create({
			userId: userId,
			beginTime: new Date()
		});

		const response = await interaction.reply({
			content: "Study session started! Click the button below when you're done.",
			components: [row],
			ephemeral: true
		});

		// Create collector for button interaction
		const collector = response.createMessageComponentCollector({ 
			componentType: ComponentType.Button,
			time: 24 * 60 * 60 * 1000 // 24 hours
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'finish-study') {
				const finishTime = new Date();
				const duration = Math.floor((finishTime.getTime() - newSession.beginTime.getTime()) / 1000);

				await TimeStudySession.findByIdAndUpdate(newSession._id, {
					finishTime,
					duration
				});

				const hours = Math.floor(duration / 3600);
				const minutes = Math.floor((duration % 3600) / 60);
				const seconds = duration % 60;

				await i.update({
					content: `Study session finished! You studied for ${hours}h ${minutes}m ${seconds}s`,
					components: []
				});
				
				collector.stop();
			}
		});

		// Handle collector end
		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const session = await TimeStudySession.findById(newSession._id);
				if (!session?.finishTime) {
					await interaction.editReply({
						content: 'Study session timed out. Please start a new session.',
						components: []
					});
				}
			}
		});

	} catch (error) {
		console.error('Error in study session:', error);
		await interaction.reply({
			content: 'Failed to manage study session. Please try again.',
			ephemeral: true
		});
	}
}
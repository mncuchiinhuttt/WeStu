import { TimeStudySession } from "../../models/TimeStudySession";
import { CommandInteraction } from "discord.js";

export async function finish_session({ interaction }: { interaction: CommandInteraction }) {
	try {
		const userId = interaction.user.id;

		// Find active session
		const activeSession = await TimeStudySession.findOne({
			userId: userId,
			finishTime: { $exists: false },
			duration: { $exists: false }
		});

		if (!activeSession) {
			await interaction.reply({
				content: "You don't have any active study session! Use /start-session to start one.",
				ephemeral: true
			});
			return;
		}

		// Calculate duration and update session
		const finishTime = new Date();
		const duration = Math.floor((finishTime.getTime() - activeSession.beginTime.getTime()) / 1000); // Duration in seconds

		activeSession.finishTime = finishTime;
		activeSession.duration = duration;
		await activeSession.save();

		// Format duration for display
		const hours = Math.floor(duration / 3600);
		const minutes = Math.floor((duration % 3600) / 60);
		const seconds = duration % 60;

		await interaction.reply({
			content: `Study session finished! You studied for ${hours}h ${minutes}m ${seconds}s`,
			ephemeral: true
		});

	} catch (error) {
		console.error('Error in finish_session:', error);
		await interaction.reply({
			content: "Failed to finish study session. Please try again.",
			ephemeral: true
		});
	}
}
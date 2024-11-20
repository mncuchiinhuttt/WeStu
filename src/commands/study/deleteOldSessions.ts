import { CommandInteraction } from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySession";
import config from "../../config.json";

export async function deleteOldSessions({ interaction }: { interaction: CommandInteraction }) {
	try {
		// Check if user is developer
		if (!config.developers.includes(interaction.user.id)) {
			await interaction.reply({
				content: "This command is only available to developers.",
				ephemeral: true
			});
			return;
		}

		// Calculate date 30 days ago
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// Delete old sessions
		const result = await TimeStudySession.deleteMany({
			beginTime: { $lt: thirtyDaysAgo }
		});

		await interaction.reply({
			content: `Successfully deleted ${result.deletedCount} old study sessions.`,
			ephemeral: true
		});

	} catch (error) {
		console.error('Error in deleteOldSessions:', error);
		await interaction.reply({
			content: "Failed to delete old sessions. Please try again.",
			ephemeral: true
		});
	}
}
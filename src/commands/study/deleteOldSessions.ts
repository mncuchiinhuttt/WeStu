import { CommandInteraction } from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySessionModel";
import config from "../../config.json";

export async function deleteOldSessions(interaction: any) {
	try {
		if (!config.developers.includes(interaction.user.id)) {
			await interaction.reply({
				content: "This command is only available to developers.",
				ephemeral: true
			});
			return;
		}

		const deletedDate = new Date();
		deletedDate.setDate(deletedDate.getDate() - 250);

		const result = await TimeStudySession.deleteMany({
			$or: [
				{ beginTime: { $lt: deletedDate } },
				{ $and: [
					{ finishTime: { $exists: false } },
					{ scheduledTime: { $exists: false } },
				] }
			]
		});

		await interaction.reply({
			content: `Successfully deleted ${(result.deletedCount)} old study sessions.`,
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
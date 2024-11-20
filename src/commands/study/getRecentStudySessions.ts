import { TimeStudySession } from "../../models/TimeStudySession";
import { CommandInteraction, EmbedBuilder } from "discord.js";

export async function getRecentStudySessions({ interaction }: { interaction: CommandInteraction }) {
	try {
		const userId = interaction.user.id;
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Fetch sessions from last 7 days
		const sessions = await TimeStudySession.find({
			userId: userId,
			beginTime: { $gte: sevenDaysAgo }
		}).sort({ beginTime: -1 }); // Latest first

		if (sessions.length === 0) {
			await interaction.reply({
				content: "You haven't had any study sessions in the last 7 days!",
				ephemeral: true
			});
			return;
		}

		// Calculate total study time
		const totalDuration = sessions.reduce((total, session) => {
			return total + (session.duration || 0);
		}, 0);

		// Create embed
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Your Study Sessions (Last 7 Days)')
			.setDescription(`Total study time: ${formatDuration(totalDuration)}`)
			.addFields(
				sessions.map(session => ({
					name: formatDate(session.beginTime),
					value: `Duration: ${formatDuration(session.duration || 0)}`,
					inline: false
				}))
			);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error('Error in list_sessions:', error);
		await interaction.reply({
			content: "Failed to fetch study sessions. Please try again.",
			ephemeral: true
		});
	}
}

function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours}h ${minutes}m`;
}

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
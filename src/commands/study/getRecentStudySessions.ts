import { TimeStudySession } from "../../models/TimeStudySession";
import { CommandInteraction, EmbedBuilder } from "discord.js";

export async function getRecentStudySessions(interaction: CommandInteraction) {
	try {
		if (!interaction?.user?.id) {
			throw new Error('Invalid interaction object');
		}

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
					value: `Duration: ${formatDuration(session.duration || 0)}${
						session.isPomodoro 
							? `\nPomodoro: ${session.pomodoroConfig?.completedSessions}/${session.pomodoroConfig?.plannedSessions} sessions` 
							: ''
					}`,
					inline: false
				}))
			);

		if (!interaction.replied) {
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
		}

	} catch (error) {
		console.error('Error in getRecentStudySessions:', error);
		if (interaction?.reply && !interaction.replied) {
			await interaction.reply({
				content: "Failed to fetch study sessions. Please try again.",
				ephemeral: true
			});
		}
	}
}

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});
}

function formatDuration(totalDuration: number): string {
	const hours = Math.floor(totalDuration / 3600);
	const minutes = Math.floor((totalDuration % 3600) / 60);
	const seconds = totalDuration % 60;
	return `${hours}h ${minutes}m ${seconds}s`;
}
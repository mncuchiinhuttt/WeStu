import { ChatInputCommandInteraction as Interaction } from 'discord.js';
import { StudyTarget } from "../../models/StudyTarget";

export async function setStudyTarget(interaction: Interaction) {
	try {
		const weeklyHours = interaction.options.getNumber('weekly_hours');
		const dailyMinHours = interaction.options.getNumber('daily_minimum');

		// Validation
		if (!weeklyHours || !dailyMinHours) {
			await interaction.reply({
				content: "Please provide both weekly target and daily minimum hours.",
				ephemeral: true
			});
			return;
		}

		if (weeklyHours < dailyMinHours * 7) {
			await interaction.reply({
				content: "Weekly target must be at least 7 times the daily minimum.",
				ephemeral: true
			});
			return;
		}

		if (weeklyHours > 168) { 
			// 24 * 7 = 168 (max hours in a week)
			await interaction.reply({
				content: "Weekly target cannot exceed 168 hours.",
				ephemeral: true
			});
			return;
		}

		// Update or create target
		await StudyTarget.findOneAndUpdate(
			{ userId: interaction.user.id },
			{
				weeklyTarget: weeklyHours,
				dailyMinimum: dailyMinHours,
				updatedAt: new Date()
			},
			{ upsert: true, new: true }
		);

		await interaction.reply({
			content: `Study target set!\n- **Weekly:** ${weeklyHours}h\n- **Daily minimum:** ${dailyMinHours}h`,
			ephemeral: true
		});

	} catch (error) {
		console.error('Error in setStudyTarget:', error);
		await interaction.reply({
			content: "Failed to set study target. Please try again.",
			ephemeral: true
		});
	}
}
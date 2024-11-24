import { ChatInputCommandInteraction as Interaction, EmbedBuilder } from 'discord.js';
import { StudyTarget } from "../../models/StudyTarget";

export async function setStudyTarget(interaction: Interaction) {
	try {
		const weeklyHours = interaction.options.getNumber('weekly_hours');
		const dailyMinHours = interaction.options.getNumber('daily_minimum');

		// Validation
		if (!weeklyHours || !dailyMinHours) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) // RED color in hex
				.setTitle('Error')
				.setDescription('Please provide both weekly target and daily minimum hours.');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (weeklyHours < dailyMinHours * 7) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) // RED color in hex
				.setTitle('Error')
				.setDescription('Weekly target must be at least 7 times the daily minimum.');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (weeklyHours > 168) { 
			// 24 * 7 = 168 (max hours in a week)
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) // RED color in hex
				.setTitle('Error')
				.setDescription('Weekly target cannot exceed 168 hours.');
			await interaction.reply({ embeds: [embed], ephemeral: true });
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

		const embed = new EmbedBuilder()
			.setColor(0x00FF00) // GREEN color in hex
			.setTitle('Study Target Set')
			.setDescription(`Study target set!\n- **Weekly:** ${weeklyHours}h\n- **Daily minimum:** ${dailyMinHours}h`);
		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error in setStudyTarget:', error);
		const embed = new EmbedBuilder()
			.setColor(0xFF0000) // RED color in hex
			.setTitle('Error')
			.setDescription('Failed to set study target. Please try again.');
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
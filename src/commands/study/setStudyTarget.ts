import { ChatInputCommandInteraction as Interaction, EmbedBuilder } from 'discord.js';
import { StudyTarget } from "../../models/StudyTarget";
import { LanguageService } from '../../utils/LanguageService';

export async function setStudyTarget(interaction: Interaction) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.study.setStudyTarget;

	try {
		const weeklyHours = interaction.options.getNumber('weekly_hours');
		const dailyMinHours = interaction.options.getNumber('daily_minimum');

		if (!weeklyHours || !dailyMinHours) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) 
				.setTitle(strings.errorTitle)
				.setDescription(strings.invalidInput);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (weeklyHours < dailyMinHours * 7) {
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) 
				.setTitle(strings.errorTitle)
				.setDescription(strings.invalidWeeklyHours);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (weeklyHours > 168) { 
			// 24 * 7 = 168 (max hours in a week)
			const embed = new EmbedBuilder()
				.setColor(0xFF0000) 
				.setTitle(strings.errorTitle)
				.setDescription(strings.invalidWeeklyHoursMax);
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
			.setTitle(strings.title)
			.setDescription(
				strings.description
				.replace('{weeklyHours}', weeklyHours.toString())
				.replace('{dailyMinHours}', dailyMinHours.toString())
			);
		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error in setStudyTarget:', error);
		const embed = new EmbedBuilder()
			.setColor(0xFF0000) 
			.setTitle(strings.errorTitle)
			.setDescription(strings.errorMessage);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
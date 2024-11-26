import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function createRecurringTask(interaction: any) {
	const title = interaction.options.getString('title');
	const frequency = interaction.options.getString('frequency');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.createRecurringTask;

	try {
		const baseTask = await Task.create({
			userId: interaction.user.id,
			title,
			recurringFrequency: frequency,
			status: 'pending',
			deadline: calculateNextDeadline(frequency)
		});

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle(path.success)
			.setDescription(`✅ ${path.successMessage}: **${title}**`)
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
		
	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle(path.error)
			.setDescription(path.errorMessage)
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}

function calculateNextDeadline(frequency: string): Date {
	const now = new Date();
	switch (frequency) {
		case 'daily':
			return new Date(now.setDate(now.getDate() + 1));
		case 'weekly':
			return new Date(now.setDate(now.getDate() + 7));
		case 'monthly':
			return new Date(now.setMonth(now.getMonth() + 1));
		default:
			return now;
	}
}
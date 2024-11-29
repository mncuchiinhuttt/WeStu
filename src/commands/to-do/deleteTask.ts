import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function deleteTask(interaction: any) {
	const taskId = interaction.options.getString('task_id');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.deleteTask;

	try {
		const task = await Task.findOneAndDelete({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(path.error)
				.setDescription(path.notFound);
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(path.success)
			.setDescription(`🗑️ ${path.successReply}: **${task.title}**`);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(path.error)
			.setDescription(path.errorReply);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
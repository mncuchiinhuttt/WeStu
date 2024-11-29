import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function addComment(interaction: any) {
	const taskId = interaction.options.getString('task_id');
	const content = interaction.options.getString('content');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.addComment;
	
	try {
		const task = await Task.findOne({
			_id: taskId,
			$or: [
				{ userId: interaction.user.id },
				{ sharedWith: interaction.user.id }
			]
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(path.error)
				.setDescription(path.taskNotFound);
			await interaction.reply({ 
				embeds: [embed], 
				ephemeral: true 
			});
			return;
		}

		task.comments.push({
			userId: interaction.user.id,
			username: interaction.user.username,
			content,
			createdAt: new Date()
		});

		await task.save();

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(path.success)
			.setDescription(`💬 ${path.successReply} **${task.title}**`);
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
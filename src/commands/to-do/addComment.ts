import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function addComment(interaction: any) {
	const taskId = interaction.options.getString('task_id');
	const content = interaction.options.getString('content');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	
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
				.setTitle(langStrings.commands.addComment.error)
				.setDescription(langStrings.commands.addComment.taskNotFound);
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
			.setTitle(langStrings.commands.todo.addComment.success)
			.setDescription(`💬 ${langStrings.commands.todo.addComment.successReply} **${task.title}**`);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(langStrings.commands.addComment.error)
			.setDescription(langStrings.commands.addComment.errorReply);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
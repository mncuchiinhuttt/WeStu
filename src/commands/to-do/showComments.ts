import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function showComments(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.showComments;
	
	try {
		const taskId = interaction.options.getString('task_id');

		const task = await Task.findOne({
			_id: taskId,
			$or: [
				{ userId: interaction.user.id },
				{ sharedWith: interaction.user.id }
			]
		});

		if (!task) {
			await interaction.reply({
				content: strings.notFound,
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(strings.success
				.replace('{title}', task.title)
			)
			.setColor('#00ff00')
			.setTimestamp();

		if (task.comments.length === 0) {
			embed.setDescription(strings.noComments);
		} else {
			task.comments.forEach((comment: any) => {
				embed.addFields({
					name: `${comment.username} - ${comment.createdAt.toLocaleString()}`,
					value: comment.content
				});
			});
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
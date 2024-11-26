import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function shareTask(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.shareTask;

	try {
		const taskId = interaction.options.getString('task_id');
		const user = interaction.options.getUser('user');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(strings.error)
				.setDescription(strings.notFound);
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
			return;
		}

		if (task.sharedWith.includes(user.id)) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(strings.error)
				.setDescription(strings.alreadyShared);
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
			return;
		}

		task.sharedWith.push(user.id);
		await task.save();

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(strings.success)
			.setDescription(strings.successMessage.replace('{title}', task.title).replace('{user}', user.username));
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
		
		try {
			const dmEmbed = new EmbedBuilder()
				.setColor(0x00ff00)
				.setTitle(strings.dmTitle)
				.setDescription(strings.dmMessage
					.replace('{user}', interaction.user.username)
					.replace('{title}', task.title)
					.replace('{deadline}', task.deadline.toLocaleDateString())
					.replace('{description}', task.description)
					.replace('{priority}', task.priority)
				);
			if (task.subtasks && task.subtasks.length > 0) {
				const subtaskList = task.subtasks.map(subtask => `- ${subtask.title}`).join('\n');
				dmEmbed.addFields({ name: strings.subtasks, value: subtaskList });
			}
			await user.send({ embeds: [dmEmbed] });
		} catch (error) {
			console.error('Failed to DM user:', error);
		}

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(strings.error)
			.setDescription(strings.failed);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
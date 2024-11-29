import { Task, TaskStatus } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function updateProgress(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.updateProgress;

	try {
		const taskId = interaction.options.getString('task_id');
		const progress = interaction.options.getInteger('percentage');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle(strings.error)
				.setDescription(strings.notFound);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		task.progress = progress;
		if (progress === 100) {
			task.status = TaskStatus.COMPLETED;
			task.completedAt = new Date();
		}

		await task.save();

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle(strings.success)
			.setDescription(
				strings.successReply
					.replace('{title}', task.title)
					.replace('{progress}', progress.toString())
			);

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle(strings.error)
			.setDescription(strings.errorReply);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
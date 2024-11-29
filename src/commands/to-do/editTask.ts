import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';
import { TaskPriority } from '../../models/TaskModel';

export async function editTask(interaction: any) {
	const taskId = interaction.options.getString('task_id');
	const newTitle = interaction.options.getString('title');
	const newDeadline = interaction.options.getString('deadline');
	const newPriority = interaction.options.getString('priority');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.editTask;

	try {
		const task = await Task.findOne({ 
			_id: taskId,
			userId: interaction.user.id 
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(path.error)
				.setDescription(path.notFound);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (newTitle) task.title = newTitle;
		if (newDeadline) task.deadline = new Date(newDeadline);
		if (newPriority) task.priority = newPriority;

		await task.save();

		const priorityString = {
			[TaskPriority.LOW]: path.priorityOptions.low,
			[TaskPriority.MEDIUM]: path.priorityOptions.medium,
			[TaskPriority.HIGH]: path.priorityOptions.high,
		};

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle(path.success)
			.setDescription(`✅ ${path.successReply}: **${task.title}**`)
			.addFields(
				{ name: path.title, value: task.title, inline: true },
				{ name: path.deadline, value: task.deadline ? task.deadline.toISOString().split('T')[0] : path.noDeadline, inline: true },
				{ name: path.priority, value: priorityString[task.priority], inline: true }
			);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(path.error)
			.setDescription(path.failed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
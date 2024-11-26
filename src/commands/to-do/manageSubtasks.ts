import { Task, TaskStatus } from '../../models/Task';
import { Document, Types } from 'mongoose';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';
import { replacePlaceholders } from '../../utils/replacePlaceholders';

interface ISubtask extends Document {
	title: string;
	completed: boolean;
	completedAt?: Date;
}

interface ITaskDocument extends Document {
	userId: string;
	title: string;
	subtasks: Types.DocumentArray<ISubtask>;
	status: TaskStatus;
}

export async function manageSubtasks(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.manageSubtasks;

	try {
		const taskId = interaction.options.getString('task_id');
		const action = interaction.options.getString('action') as 'add' | 'remove' | 'complete';
		const title = interaction.options.getString('title');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		}) as ITaskDocument;

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor('#FF0000') // Red color in hex
				.setDescription(strings.notFound);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		let savedDescription = '';

		switch (action) {
			case 'add':
				const newSubtask = task.subtasks.create({
					title,
					completed: false
				});
				task.subtasks.push(newSubtask);
				savedDescription = strings.description.add;
				break;

			case 'remove':
				const indexToRemove = task.subtasks.findIndex(st => st.title === title);
				if (indexToRemove > -1) {
					task.subtasks.splice(indexToRemove, 1);
				}
				savedDescription = strings.description.remove;
				break;

			case 'complete':
				const subtask = task.subtasks.find(st => st.title === title);
				if (subtask) {
					subtask.completed = true;
					subtask.completedAt = new Date();
				}
				savedDescription = strings.description.complete;
				break;
		}

		await task.save();

		const subtaskList = task.subtasks.map(st => `- ${st.title} ${st.completed ? '✅' : '❌'}`).join('\n');
		const description = `✅ ${savedDescription}: ${title}`;
		const embed = new EmbedBuilder()
			.setColor('#00FF00') 
			.setTitle(`${strings.title}: ${task.title}`)
			.setDescription(`${description}\n\n**${strings.subtasks}:**\n${subtaskList}`);
		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000') // Red color in hex
			.setDescription(strings.error);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
import { Task, TaskStatus } from '../../models/Task';
import { Document, Types } from 'mongoose';
import { EmbedBuilder } from 'discord.js';

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
	try {
		const taskId = interaction.options.getString('task_id');
		const action = interaction.options.getString('action');
		const title = interaction.options.getString('title');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		}) as ITaskDocument;

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor('#FF0000') // Red color in hex
				.setDescription('Task not found');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		switch (action) {
			case 'add':
				const newSubtask = task.subtasks.create({
					title,
					completed: false
				});
				task.subtasks.push(newSubtask);
				break;

			case 'remove':
				const indexToRemove = task.subtasks.findIndex(st => st.title === title);
				if (indexToRemove > -1) {
					task.subtasks.splice(indexToRemove, 1);
				}
				break;

			case 'complete':
				const subtask = task.subtasks.find(st => st.title === title);
				if (subtask) {
					subtask.completed = true;
					subtask.completedAt = new Date();
				}
				break;
		}

		await task.save();

		const subtaskList = task.subtasks.map(st => `- ${st.title} ${st.completed ? '✅' : '❌'}`).join('\n');
		const description = action === 'complete' ? `✅ Subtask completed: ${title}` : `✅ Subtask ${action}ed: ${title}`;
		const embed = new EmbedBuilder()
			.setColor('#00FF00') // Green color in hex
			.setTitle(`Task: ${task.title}`)
			.setDescription(`${description}\n\n**Subtasks:**\n${subtaskList}`);
		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000') // Red color in hex
			.setDescription('Failed to manage subtask');
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
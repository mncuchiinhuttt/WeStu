import { Task, TaskStatus } from '../../models/Task';
import { Document, Types } from 'mongoose';

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
			await interaction.reply({ content: 'Task not found', ephemeral: true });
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
		await interaction.reply({ content: `✅ Subtask ${action}ed: ${title}`, ephemeral: true });

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to manage subtask', ephemeral: true });
	}
}
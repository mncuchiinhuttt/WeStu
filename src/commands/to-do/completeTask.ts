import { Task, TaskStatus } from '../../models/Task';

export async function completeTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const task = await Task.findOne({ 
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply('Task not found');
			return;
		}

		task.status = TaskStatus.COMPLETED;
		task.completedAt = new Date();
		await task.save();

		await interaction.reply({
			content: `✅ Completed task: **${task.title}**`,
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to complete task');
	}
}
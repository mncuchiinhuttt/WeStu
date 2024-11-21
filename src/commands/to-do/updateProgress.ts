import { Task, TaskStatus } from '../../models/Task';

export async function updateProgress(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const progress = interaction.options.getInteger('percentage');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply({ content: 'Task not found', ephemeral: true });
			return;
		}

		task.progress = progress;
		if (progress === 100) {
			task.status = TaskStatus.COMPLETED;
			task.completedAt = new Date();
		}

		await task.save();
		await interaction.reply({ content: `✅ Updated progress for **${task.title}** to ${progress}%`, ephemeral: true });

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to update progress', ephemeral: true });
	}
}
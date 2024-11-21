import { Task } from '../../models/Task';

export async function deleteTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const task = await Task.findOneAndDelete({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply({
				content: 'Task not found',
				ephemeral: true
			});
			return;
		}

		await interaction.reply({
			content: `🗑️ Deleted task: **${task.title}**`,
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to delete task',
			ephemeral: true
		});
	}
}
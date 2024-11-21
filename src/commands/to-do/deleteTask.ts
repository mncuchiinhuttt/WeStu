import { Task } from '../../models/Task';

export async function deleteTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const task = await Task.findOneAndDelete({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply('Task not found');
			return;
		}

		await interaction.reply({
			content: `🗑️ Deleted task: **${task.title}**`,
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to delete task');
	}
}
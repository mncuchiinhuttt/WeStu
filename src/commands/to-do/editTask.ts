import { Task } from '../../models/Task';

export async function editTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const newTitle = interaction.options.getString('title');
		const newDeadline = interaction.options.getString('deadline');
		const newPriority = interaction.options.getString('priority');

		const task = await Task.findOne({ 
			_id: taskId,
			userId: interaction.user.id 
		});

		if (!task) {
			await interaction.reply({ content: 'Task not found', ephemeral: true });
			return;
		}

		if (newTitle) task.title = newTitle;
		if (newDeadline) task.deadline = new Date(newDeadline);
		if (newPriority) task.priority = newPriority;

		await task.save();
		await interaction.reply({ content: `✅ Task updated: **${task.title}**`, ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to edit task', ephemeral: true });
	}
}
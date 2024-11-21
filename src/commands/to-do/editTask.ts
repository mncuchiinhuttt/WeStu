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
			await interaction.reply('Task not found');
			return;
		}

		if (newTitle) task.title = newTitle;
		if (newDeadline) task.deadline = new Date(newDeadline);
		if (newPriority) task.priority = newPriority;

		await task.save();
		await interaction.reply(`✅ Task updated: **${task.title}**`);
	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to edit task');
	}
}
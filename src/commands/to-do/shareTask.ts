import { Task } from '../../models/Task';

export async function shareTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const user = interaction.options.getUser('user');

		const task = await Task.findOne({
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

		if (task.sharedWith.includes(user.id)) {
			await interaction.reply({
				content: 'Task already shared with this user',
				ephemeral: true
			});
			return;
		}

		task.sharedWith.push(user.id);
		await task.save();

		await interaction.reply({
			content: `✅ Shared task **${task.title}** with ${user.username}`,
			ephemeral: true
		});
		
		try {
			await user.send(
				`📋 ${interaction.user.username} shared a task with you:\n` +
				`**${task.title}**\nDue: ${task.deadline.toLocaleDateString()}`
			);
		} catch (error) {
			console.error('Failed to DM user:', error);
		}

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to share task',
			ephemeral: true
		});
	}
}
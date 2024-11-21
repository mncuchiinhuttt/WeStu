import { Task } from '../../models/Task';

export async function addComment(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const content = interaction.options.getString('content');

		const task = await Task.findOne({
			_id: taskId,
			$or: [
				{ userId: interaction.user.id },
				{ sharedWith: interaction.user.id }
			]
		});

		if (!task) {
			await interaction.reply({ 
				content: 'Task not found or no access', 
				ephemeral: true 
			});
			return;
		}

		task.comments.push({
			userId: interaction.user.id,
			username: interaction.user.username,
			content,
			createdAt: new Date()
		});

		await task.save();
		await interaction.reply({
			content: `💬 Added comment to **${task.title}**`,
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to add comment',
			ephemeral: true
		});
	}
}
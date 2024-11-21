import { Task } from '../../models/Task';

export async function manageTags(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const tagsString = interaction.options.getString('tags');
		
		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply({ content: 'Task not found', ephemeral: true });
			return;
		}

		// Add explicit type for tag parameter
		const tags: string[] = tagsString.split(',').map((tag: string) => tag.trim());
		task.tags = tags;
		await task.save();

		await interaction.reply({ content: `✅ Updated tags for **${task.title}**:\n${tags.join(', ')}`, ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to update tags', ephemeral: true });
	}
}
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
			await interaction.reply('Task not found');
			return;
		}

		// Add explicit type for tag parameter
		const tags: string[] = tagsString.split(',').map((tag: string) => tag.trim());
		task.tags = tags;
		await task.save();

		await interaction.reply(`✅ Updated tags for **${task.title}**:\n${tags.join(', ')}`);
	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to update tags');
	}
}
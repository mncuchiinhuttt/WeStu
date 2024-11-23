import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

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
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('Error')
				.setDescription('Task not found or no access');
			await interaction.reply({ 
				embeds: [embed], 
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

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Comment Added')
			.setDescription(`💬 Added comment to **${task.title}**`);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Error')
			.setDescription('Failed to add comment');
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
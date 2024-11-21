import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function showComments(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');

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

		const embed = new EmbedBuilder()
			.setTitle(`💬 Comments for: ${task.title}`)
			.setColor('#00ff00')
			.setTimestamp();

		if (task.comments.length === 0) {
			embed.setDescription('No comments yet');
		} else {
			task.comments.forEach((comment: any) => {
				embed.addFields({
					name: `${comment.username} - ${comment.createdAt.toLocaleString()}`,
					value: comment.content
				});
			});
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to show comments',
			ephemeral: true
		});
	}
}
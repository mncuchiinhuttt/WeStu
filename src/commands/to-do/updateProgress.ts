import { Task, TaskStatus } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function updateProgress(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const progress = interaction.options.getInteger('percentage');

		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor('#FF0000')
				.setTitle('Error')
				.setDescription('Task not found');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		task.progress = progress;
		if (progress === 100) {
			task.status = TaskStatus.COMPLETED;
			task.completedAt = new Date();
		}

		await task.save();

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle('Progress Updated')
			.setDescription(`✅ Updated progress for **${task.title}** to ${progress}%`);

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle('Error')
			.setDescription('Failed to update progress');
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function deleteTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const task = await Task.findOneAndDelete({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('Error')
				.setDescription('Task not found');
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Task Deleted')
			.setDescription(`🗑️ Deleted task: **${task.title}**`);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Error')
			.setDescription('Failed to delete task');
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

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
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('Error')
				.setDescription('Task not found');
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (newTitle) task.title = newTitle;
		if (newDeadline) task.deadline = new Date(newDeadline);
		if (newPriority) task.priority = newPriority;

		await task.save();

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Task Updated')
			.setDescription(`✅ Task updated: **${task.title}**`);
		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Error')
			.setDescription('Failed to edit task');
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
}
import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function shareTask(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const user = interaction.options.getUser('user');

		const task = await Task.findOne({
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

		if (task.sharedWith.includes(user.id)) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('Error')
				.setDescription('Task already shared with this user');
			await interaction.reply({
				embeds: [embed],
				ephemeral: true
			});
			return;
		}

		task.sharedWith.push(user.id);
		await task.save();

		const embed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Task Shared')
			.setDescription(`✅ Shared task **${task.title}** with ${user.username}`);
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
		
		try {
		const dmEmbed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setTitle('Task Shared')
			.setDescription(`📋 ${interaction.user.username} shared a task with you:\n**${task.title}**\nDue: ${task.deadline.toLocaleDateString()}\nDescription: ${task.description}\nPriority: ${task.priority}`);
		if (task.subtasks && task.subtasks.length > 0) {
			const subtaskList = task.subtasks.map(subtask => `- ${subtask.title}`).join('\n');
			dmEmbed.addFields({ name: 'Subtasks', value: subtaskList });
		}
		await user.send({ embeds: [dmEmbed] });
		} catch (error) {
			console.error('Failed to DM user:', error);
		}

	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Error')
			.setDescription('Failed to share task');
		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
}
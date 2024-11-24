import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

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

		const tags: string[] = tagsString.split(',').map((tag: string) => tag.trim());
		task.tags = tags;
		await task.save();

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle('Tags Updated')
			.setDescription(`✅ Updated tags for **${task.title}**`)
			.addFields({ name: 'Tags', value: tags.join(', '), inline: false });

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to update tags', ephemeral: true });
	}
}
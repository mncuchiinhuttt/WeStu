import { EmbedBuilder } from 'discord.js';
import { Task } from '../../models/Task';

export async function searchTasks(interaction: any) {
	try {
		const query = interaction.options.getString('query');
		const tasks = await Task.find({
			userId: interaction.user.id,
			$or: [
				{ title: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } },
				{ tags: { $regex: query, $options: 'i' } }
			]
		}).sort({ deadline: 1 });

		const embed = new EmbedBuilder()
			.setTitle(`🔍 Search Results: "${query}"`)
			.setColor('#0099ff');

		if (tasks.length === 0) {
			embed.setDescription('No tasks found');
		} else {
			tasks.forEach(task => {
				embed.addFields({
					name: task.title,
					value: `Due: ${task.deadline.toLocaleDateString()}\nStatus: ${task.status}\nID: ${task._id}`
				});
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Search failed', ephemeral: true });
	}
}
import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function saveTemplate(interaction: any) {
	try {
		const taskId = interaction.options.getString('task_id');
		const templateName = interaction.options.getString('name');

		const sourceTask = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!sourceTask) {
			await interaction.reply({
				content: 'Task not found',
				ephemeral: true
			});
			return;
		}

		const farFutureDate = new Date();
		farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);

		// Create template from task
		const template = await Task.create({
			userId: interaction.user.id,
			title: sourceTask.title,
			description: sourceTask.description,
			priority: sourceTask.priority,
			category: sourceTask.category,
			tags: sourceTask.tags,
			subtasks: sourceTask.subtasks,
			template: true,
			templateName,
			deadline: farFutureDate
		});

		const embed = new EmbedBuilder()
			.setTitle(`✅ Saved template: **${templateName}**`)
			.addFields(
				{ name: 'Title', value: template.title, inline: true },
				{ name: 'Description', value: template.description || 'No description', inline: true },
				{ name: 'Priority', value: template.priority.toString(), inline: true },
				{ name: 'Category', value: template.category || 'No category', inline: true },
				{ name: 'Tags', value: template.tags.join(', ') || 'No tags', inline: true },
				{ name: 'Subtasks', value: template.subtasks.length.toString(), inline: true }
			)
			.setTimestamp()
			.setColor('#00FF00');

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to save template',
			ephemeral: true
		});
	}
}
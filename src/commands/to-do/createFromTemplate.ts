import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function createFromTemplate(interaction: any) {
	try {
		const templateName = interaction.options.getString('template_name');
		
		const template = await Task.findOne({
			userId: interaction.user.id,
			template: true,
			templateName
		});

		if (!template) {
			await interaction.reply({
				content: 'Template not found',
				ephemeral: true
			});
			return;
		}

		// Create new task from template
		const task = await Task.create({
			userId: interaction.user.id,
			title: template.title,
			description: template.description,
			deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
			priority: template.priority,
			category: template.category,
			tags: template.tags,
			subtasks: template.subtasks.map(st => ({
				title: st.title,
				completed: false
			})),
			template: false
		});

		const embed = new EmbedBuilder()
			.setTitle('Task Created from Template')
			.setDescription(`✅ Created task from template: **${task.title}**`)
			.addFields(
				{ name: 'Description', value: task.description || 'No description', inline: true },
				{ name: 'Priority', value: task.priority || 'No priority', inline: true },
				{ name: 'Category', value: task.category || 'No category', inline: true },
				{ name: 'Tags', value: task.tags.join(', ') || 'No tags', inline: true },
				{ name: 'Subtasks', value: task.subtasks.map(st => st.title).join(', ') || 'No subtasks', inline: true }
			)
			.setFooter({ text: 'Use `/todo edit` to set deadline' });

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to create from template',
			ephemeral: true
		});
	}
}
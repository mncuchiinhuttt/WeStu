import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function createFromTemplate(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.createFromTemplate;

	const templateName = interaction.options.getString('template_name');

	try {
		
		const template = await Task.findOne({
			userId: interaction.user.id,
			template: true,
			templateName
		});

		if (!template) {
			await interaction.reply({
				content: path.notFound,
				ephemeral: true
			});
			return;
		}

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
			.setTitle(path.success)
			.setDescription(`✅ ${path.successMessage}: **${task.title}**`)
			.addFields(
				{ name: path.description, value: task.description ?? path.noDescription, inline: true },
				{ name: path.priority, value: task.priority ?? path.noPriority, inline: true },
				{ name: path.category, value: task.category ?? path.noCategory, inline: true },
				{ name: path.tags, value: task.tags.join(', ') ?? path.noTags, inline: true },
				{ name: path.subtasks, value: task.subtasks.map(st => st.title).join(', ') ?? path.noSubtasks, inline: true }
			)
			.setFooter({ text: path.successFooter });

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: path.failed,
			ephemeral: true
		});
	}
}
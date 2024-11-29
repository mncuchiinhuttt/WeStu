import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';
import { TaskPriority } from '../../models/TaskModel';

export async function saveTemplate(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.saveTemplate;

	try {
		const taskId = interaction.options.getString('task_id');
		const templateName = interaction.options.getString('name');

		const sourceTask = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!sourceTask) {
			await interaction.reply({
				content: strings.notFound,
				ephemeral: true
			});
			return;
		}

		const farFutureDate = new Date();
		farFutureDate.setFullYear(farFutureDate.getFullYear() + 100);

		const template = await Task.create({
			userId: interaction.user.id,
			title: sourceTask.title,
			description: sourceTask.description,
			priority: sourceTask.priority,
			category: sourceTask.category,
			tags: sourceTask.tags,
			subtasks: sourceTask.subtasks,
			template: true,
			templateName: templateName,
			deadline: farFutureDate
		});

		const priorityString = {
			[TaskPriority.LOW]: strings.priorityOptions.low,
			[TaskPriority.MEDIUM]: strings.priorityOptions.medium,
			[TaskPriority.HIGH]: strings.priorityOptions.high,
		};

		const embed = new EmbedBuilder()
			.setTitle(`✅ ${strings.saved}: **${templateName}**`)
			.addFields(
				{ name: strings.title, value: template.title, inline: true },
				{ name: strings.description, value: template.description ?? strings.noDescription, inline: true },
				{ name: strings.priority, value: priorityString[template.priority], inline: true },
				{ name: strings.category, value: template.category ?? strings.noCategory, inline: true },
				{ name: strings.tags, value: template.tags?.length > 0 ? template.tags.join(', ') : strings.noTags, inline: true },
				{ name: strings.subtasks, value: template.subtasks.length.toString(), inline: true }
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
			content: `❌ ${strings.error}`,
			ephemeral: true
		});
	}
}
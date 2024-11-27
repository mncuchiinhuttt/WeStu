import { Task, TaskPriority } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function addTask(interaction: any) {
	const title = interaction.options.getString('title');
	const deadline = new Date(interaction.options.getString('deadline'));
	const priority = interaction.options.getString('priority') as TaskPriority ?? TaskPriority.MEDIUM;
	const subject = interaction.options.getString('subject');
	const description = interaction.options.getString('description');
	const reminder = interaction.options.getBoolean('reminder') ?? false;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.addTask;

	try {
		if (deadline < new Date()) {
			await interaction.reply(path.deadlineError);
			return;
		}

		const task = await Task.create({
			userId: interaction.user.id,
			title,
			deadline,
			priority,
			subject,
			description,
			reminder,
			progress: 0,
		});

		const priorityString = {
			[TaskPriority.LOW]: path.priorityOptions.low,
			[TaskPriority.MEDIUM]: path.priorityOptions.medium,
			[TaskPriority.HIGH]: path.priorityOptions.high,
		};

		const embed = new EmbedBuilder()
			.setTitle(`✅ ${path.success}`)
			.addFields(
			{ name: `${path.title}`, value: title, inline: true },
			{ name: `${path.deadline}`, value: deadline.toLocaleString(), inline: true },
			{ name: `${path.priority}`, value: priorityString[priority], inline: true },
			{ name: `${path.subject}`, value: subject, inline: true },
			{ name: `${path.description}`, value: description, inline: true },
			{ name: `${path.reminder}`, value: reminder ? 'Yes' : 'No', inline: true }
			)
			.setColor(0x00FF00);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: `❌ ${path.error}`,
			ephemeral: true
		});
	}
}
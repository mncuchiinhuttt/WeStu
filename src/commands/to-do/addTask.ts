import { Task, TaskPriority } from '../../models/TaskModel';
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
	const strings = langStrings.commands.todo.addTask;

	try {
		if (deadline < new Date()) {
			await interaction.reply(strings.deadlineError);
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

		const priorityString = (priority: TaskPriority) => {
			if (priority === TaskPriority.LOW) return strings.priorityOptions.low;
			else if (priority === TaskPriority.MEDIUM) return strings.priorityOptions.medium;
			else if (priority === TaskPriority.HIGH) return strings.priorityOptions.high;
			else return '';
		};

		const embed = new EmbedBuilder()
			.setTitle(`✅ ${strings.success}`)
			.addFields(
			{ name: `${strings.title}`, value: title, inline: true },
			{ name: `${strings.deadline}`, value: deadline.toLocaleString(), inline: true },
			{ name: `${strings.priority}`, value: priorityString(priority), inline: true },
			{ name: `${strings.subject}`, value: subject ?? strings.noSubject, inline: true },
			{ name: `${strings.description}`, value: description ?? strings.noDescription, inline: true },
			{ name: `${strings.reminder}`, value: reminder ? strings.yes : strings.no, inline: true }
			)
			.setColor(0x00FF00);

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
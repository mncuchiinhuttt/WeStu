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

	try {
		if (deadline < new Date()) {
			await interaction.reply(langStrings.commands.todo.addTask.deadlineError);
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
			[TaskPriority.LOW]: langStrings.commands.todo.addTask.priorityOptions.low,
			[TaskPriority.MEDIUM]: langStrings.commands.todo.addTask.priorityOptions.medium,
			[TaskPriority.HIGH]: langStrings.commands.todo.addTask.priorityOptions.high,
		};

		const embed = new EmbedBuilder()
			.setTitle(`✅ ${langStrings.commands.todo.addTask.success}`)
			.addFields(
			{ name: `${langStrings.commands.todo.addTask.title}`, value: title, inline: true },
			{ name: `${langStrings.commands.todo.addTask.deadline}`, value: deadline.toLocaleString(), inline: true },
			{ name: `${langStrings.commands.todo.addTask.priority}`, value: priorityString[priority], inline: true },
			{ name: `${langStrings.commands.todo.addTask.subject}`, value: subject, inline: true },
			{ name: `${langStrings.commands.todo.addTask.description}`, value: description, inline: true },
			{ name: `${langStrings.commands.todo.addTask.reminder}`, value: reminder ? 'Yes' : 'No', inline: true }
			)
			.setColor(0x00FF00);

		await interaction.editReply({
			embeds: [embed],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply(`❌ ${langStrings.commands.todo.addTask.error}`);
	}
}
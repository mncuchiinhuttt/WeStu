import { Task, TaskPriority } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function addTask(interaction: any) {
	try {
	const title = interaction.options.getString('title');
	const deadline = new Date(interaction.options.getString('deadline'));
	const priority = interaction.options.getString('priority') ?? TaskPriority.MEDIUM;
	const subject = interaction.options.getString('subject');
	const description = interaction.options.getString('description');
	const reminder = interaction.options.getBoolean('reminder') ?? false;

	if (deadline < new Date()) {
		await interaction.reply('Deadline cannot be in the past!');
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

	const embed = new EmbedBuilder()
		.setTitle('✅ Task Created')
		.addFields(
		{ name: 'Title', value: title, inline: true },
		{ name: 'Deadline', value: deadline.toLocaleString(), inline: true },
		{ name: 'Priority', value: priority, inline: true },
		{ name: 'Subject', value: subject, inline: true },
		{ name: 'Description', value: description, inline: true },
		{ name: 'Reminder', value: reminder ? 'Yes' : 'No', inline: true }
		)
		.setColor(0x00FF00);

	await interaction.reply({
		embeds: [embed],
		ephemeral: true
	});

	} catch (error) {
	console.error(error);
	await interaction.reply('Failed to create task');
	}
}
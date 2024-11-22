import { Task, TaskPriority } from '../../models/Task';

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

	await interaction.reply({
	  content: `✅ Task created: **${title}**\nDeadline: ${deadline.toLocaleString()}`,
	  ephemeral: true
	});

  } catch (error) {
	console.error(error);
	await interaction.reply('Failed to create task');
  }
}
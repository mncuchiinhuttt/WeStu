import { Task } from '../../models/Task';

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

		await interaction.reply({
			content: `✅ Saved template: **${templateName}**`,
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
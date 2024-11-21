import { Task } from '../../models/Task';

export async function manageCategories(interaction: any) {
	try {
		const action = interaction.options.getString('action');
		const name = interaction.options.getString('name');
		const taskId = interaction.options.getString('task_id');

		switch (action) {
			case 'create':
				// Create first task in category
				await Task.create({
					userId: interaction.user.id,
					title: name,
					category: name,
					deadline: new Date()
				});
				await interaction.reply({ content: `✅ Created category: ${name}`, ephemeral: true });
				break;

			case 'move':
				const task = await Task.findOne({
					_id: taskId,
					userId: interaction.user.id
				});

				if (!task) {
					await interaction.reply({ content: 'Task not found', ephemeral: true });
					return;
				}

				task.category = name;
				await task.save();
				await interaction.reply({ content: `✅ Moved task to category: ${name}`, ephemeral: true });
				break;
		}

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to manage categories', ephemeral: true });
	}
}
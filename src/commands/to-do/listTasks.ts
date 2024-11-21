import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

enum TaskStatus {
	PENDING = 'pending',
	IN_PROGRESS = 'in_progress', 
	COMPLETED = 'completed',
	OVERDUE = 'overdue'
}

export async function listTasks(interaction: any) {
	const filter = interaction.options.getString('filter') || 'all';
	const userId = interaction.user.id;

	try {
		let query: { userId: string, status?: TaskStatus, deadline?: { $lt?: Date, $gte?: Date, $lte?: Date } } = { userId };
		const now = new Date();

		switch(filter) {
			case 'pending':
				query = { ...query, status: TaskStatus.PENDING };
				break;
			case 'completed':
				query = { ...query, status: TaskStatus.COMPLETED };
				break;
			case 'overdue':
				query = { 
					...query, 
					status: TaskStatus.PENDING,
					deadline: { $lt: now }
				};
				break;
			case 'due_soon':
				const twoDaysFromNow = new Date();
				twoDaysFromNow.setDate(now.getDate() + 2);
				query = {
					...query,
					status: TaskStatus.PENDING,
					deadline: { $gte: now, $lte: twoDaysFromNow }
				};
				break;
		}

		const tasks = await Task.find(query).sort({ deadline: 1 });

		const embed = new EmbedBuilder()
			.setTitle('Your Tasks')
			.setColor('#0099ff');

		if (tasks.length === 0) {
			embed.setDescription('No tasks found');
		} else {
			tasks.forEach(task => {
				const dueDate = task.deadline.toLocaleDateString();
				const status = task.status === TaskStatus.COMPLETED ? '✅' : '⏳';
				embed.addFields({
					name: `${status} ${task.title} (${task.priority})`,
					value: `Due: ${dueDate}\n${task.description || 'No description'}\nID: ${task._id}`
				});
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to fetch tasks');
	}
}
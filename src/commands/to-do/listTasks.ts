import { Task, TaskStatus } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function listTasks(interaction: any) {
	const filter = interaction.options.getString('filter') || 'all';
	const userId = interaction.user.id;

	try {
		let query: any = { 
			$or: [
				{ userId },
				{ sharedWith: userId }
			]
		};
		const now = new Date();

		switch(filter) {
			case 'pending':
				query.status = TaskStatus.PENDING;
				break;
			case 'completed':
				query.status = TaskStatus.COMPLETED;
				break;
			case 'overdue':
				query.status = TaskStatus.PENDING;
				query.deadline = { $lt: now };
				break;
			case 'due_soon':
				const twoDaysFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
				query.status = TaskStatus.PENDING;
				query.deadline = { $gte: now, $lte: twoDaysFromNow };
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
				const progress = task.progress ? `[${task.progress}%] ` : '';
				const recurring = task.recurringFrequency ? `🔄 ${task.recurringFrequency} ` : '';
				const category = task.category ? `📁 ${task.category} ` : '';
				const tags = task.tags?.length ? `🏷️ ${task.tags.join(', ')} ` : '';
				
				let fieldValue = [
					`Due: ${dueDate}`,
					task.description ? `Description: ${task.description}` : null,
					`Progress: ${progress}`,
					category ? `Category: ${category}` : null,
					tags ? `Tags: ${tags}` : null,
					`ID: ${task._id}`
				].filter(Boolean).join('\n');

				// Add subtasks if any
				if (task.subtasks?.length > 0) {
					fieldValue += '\nSubtasks:\n' + task.subtasks.map((st: any) => 
						`${st.completed ? '✓' : '○'} ${st.title}`
					).join('\n');
				}

				// Add shared users if any
				if (task.sharedWith?.length > 0) {
					fieldValue += '\nShared with: ' + task.sharedWith.length + ' users';
				}

				embed.addFields({
					name: `${status} ${recurring}${category}${task.title} (${task.priority})`,
					value: fieldValue
				});
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to fetch tasks');
	}
}
import { Client, EmbedBuilder } from 'discord.js';
import { Task, TaskStatus } from '../../models/Task';

export default async (client: Client) => {
	console.log('Task reminder system initialized');
	
	// Initial check
	await checkAndSendTaskReminders(client);
	
	// Check every hour
	setInterval(async () => {
		await checkAndSendTaskReminders(client);
	}, 60 * 60 * 1000);
};

async function checkAndSendTaskReminders(client: Client) {
	try {
		const now = new Date();
		const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		const urgentTasks = await Task.find({
			status: TaskStatus.PENDING,
			deadline: {
				$gt: now,
				$lte: oneDayFromNow
			},
			reminderSent: { $ne: true }
		});

		// Group tasks by user
		const tasksByUser = urgentTasks.reduce((acc: {[key: string]: any[]}, task) => {
			if (!acc[task.userId]) {
				acc[task.userId] = [];
			}
			acc[task.userId].push(task);
			return acc;
		}, {});

		for (const [userId, tasks] of Object.entries(tasksByUser)) {
			try {
				const user = await client.users.fetch(userId);
				const embed = new EmbedBuilder()
					.setTitle('⚠️ Task Reminder')
					.setDescription(`You have ${tasks.length} task(s) due within 24 hours:`)
					.setColor('#FF0000')
					.setTimestamp();

				tasks.forEach(task => {
					embed.addFields([
						{
							name: `📌 ${task.title}`,
							value: `**Due:** ${task.deadline.toLocaleString()}\n` +
								`**Priority:** ${task.priority}\n` +
								(task.category ? `**Category:** ${task.category}\n` : '') +
								(task.progress ? `**Progress:** ${task.progress}%\n` : '') +
								(task.subtasks?.length ? `**Subtasks:** ${task.subtasks.filter((st: any) => !st.completed).length} remaining\n` : '') +
								(task.tags?.length ? `**Tags:** ${task.tags.join(', ')}\n` : '')
						}
					]);
				});

				embed.addFields([{ name: 'Note', value: 'Use `/todo list` to view all your tasks.' }]);

				await user.send({ embeds: [embed] });

				// Mark reminders as sent
				await Task.updateMany(
					{ _id: { $in: tasks.map(t => t._id) } },
					{ $set: { reminderSent: true } }
				);

			} catch (error) {
				console.error(`Failed to send reminder to user ${userId}:`, error);
			}
		}

	} catch (error) {
		console.error('Error in task reminder system:', error);
	}
}
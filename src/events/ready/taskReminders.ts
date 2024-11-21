import { Client } from 'discord.js';
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
				let message = `⚠️ **Task Reminder**\n\n`;
				message += `You have ${tasks.length} task(s) due within 24 hours:\n\n`;
				
				tasks.forEach(task => {
					message += `📌 **${task.title}**\n`;
					message += `⏰ Due: ${task.deadline.toLocaleString()}\n`;
					message += `🏷️ Priority: ${task.priority}\n`;
					message += task.category ? `📁 Category: ${task.category}\n` : '';
					message += task.progress ? `📊 Progress: ${task.progress}%\n` : '';
					message += task.subtasks?.length ? 
						`📋 Subtasks: ${task.subtasks.filter((st: any) => !st.completed).length} remaining\n` : '';
					message += task.tags?.length ? `🏷️ Tags: ${task.tags.join(', ')}\n` : '';
					message += '\n';
				});

				message += `Use \`/todo list\` to view all your tasks.`;
				
				await user.send(message);

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
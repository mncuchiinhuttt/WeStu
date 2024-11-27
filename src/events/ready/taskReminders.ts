import { Client, EmbedBuilder } from 'discord.js';
import { Task, TaskStatus } from '../../models/Task';
import { LanguageService } from '../../utils/LanguageService';

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

				const languageService = LanguageService.getInstance();
				const userLang = await languageService.getUserLanguage(userId);
				const langStrings = require(`../../data/languages/${userLang}.json`);
				const strings = langStrings.events.taskReminders;

				const embed = new EmbedBuilder()
					.setTitle(strings.title)
					.setDescription(
						strings.title
						.replace('{length}', tasks.length)
					)
					.setColor('#FF0000')
					.setTimestamp();

				tasks.forEach(task => {
					embed.addFields([
						{
							name: `📌 ${task.title}`,
							value: `${strings.due} ${task.deadline.toLocaleString()}\n` +
								`${strings.priority} ${task.priority}\n` +
								(task.category ? `${strings.category} ${task.category}\n` : '') +
								(task.progress ? `${strings.progress} ${task.progress}%\n` : '') +
								(task.subtasks?.length ? `${strings.subtasks} ${task.subtasks.filter((st: any) => !st.completed).length} ${strings.remaining}\n` : '') +
								(task.tags?.length ? `${strings.tags} ${task.tags.join(', ')}\n` : '')
						}
					]);
				});

				embed.addFields([{ name: strings.note, value: strings.noteValue }]);

				await user.send({ embeds: [embed] });

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
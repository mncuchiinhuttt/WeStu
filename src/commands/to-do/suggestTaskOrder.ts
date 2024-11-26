import { Task, TaskStatus, TaskPriority } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

interface TaskScore {
	task: any;
	score: number;
	reason: string;
}

export async function suggestTaskOrder(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.suggestTaskOrder;

	try {
		const userId = interaction.user.id;
		const tasks = await Task.find({
			userId,
			status: TaskStatus.PENDING
		});

		if (tasks.length === 0) {
			await interaction.reply(strings.noTasks);
			return;
		}

		const now = new Date();
		const scoredTasks: TaskScore[] = tasks.map(task => {
			let score = 0;
			let reasons = [];

			const daysUntilDue = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
			if (daysUntilDue < 0) {
				score += 50;
				reasons.push(strings.dueDate.overDue);
			} else if (daysUntilDue <= 1) {
				score += 45;
				reasons.push(strings.dueDate.under1);
			} else if (daysUntilDue <= 3) {
				score += 35;
				reasons.push(strings.dueDate.under3);
			} else if (daysUntilDue <= 7) {
				score += 25;
				reasons.push(strings.dueDate.under7);
			}

			switch (task.priority) {
				case TaskPriority.HIGH:
					score += 30;
					reasons.push(strings.priority.high);
					break;
				case TaskPriority.MEDIUM:
					score += 20;
					reasons.push(strings.priority.medium);
					break;
				case TaskPriority.LOW:
					score += 10;
					reasons.push(strings.priority.low);
					break;
			}

			return {
				task,
				score,
				reason: reasons.join(', ')
			};
		});

		scoredTasks.sort((a, b) => b.score - a.score);

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(strings.description)
			.setColor('#00ff00')
			.setTimestamp();

		scoredTasks.forEach((scoredTask, index) => {
			const task = scoredTask.task;
			const deadline = task.deadline.toLocaleDateString();
			
			embed.addFields({
				name: `${index + 1}. ${task.title}`,
				value: strings.taskInfo
					.replace('{deadline}', deadline)
					.replace('{priority}', task.priority)
					.replace('{reason}', scoredTask.reason)
			});
		});

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error in suggestTaskOrder:', error);
		await interaction.reply(strings.error);
	}
}
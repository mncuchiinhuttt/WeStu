import { Task, TaskStatus, TaskPriority } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

interface TaskScore {
	task: any;
	score: number;
	reason: string;
}

export async function suggestTaskOrder(interaction: any) {
	try {
		const userId = interaction.user.id;
		const tasks = await Task.find({
			userId,
			status: TaskStatus.PENDING
		});

		if (tasks.length === 0) {
			await interaction.reply('No pending tasks found!');
			return;
		}

		const now = new Date();
		const scoredTasks: TaskScore[] = tasks.map(task => {
			let score = 0;
			let reasons = [];

			// Deadline factor (0-50 points)
			const daysUntilDue = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
			if (daysUntilDue < 0) {
				score += 50;
				reasons.push('⚠️ Overdue');
			} else if (daysUntilDue <= 1) {
				score += 45;
				reasons.push('🔥 Due within 24 hours');
			} else if (daysUntilDue <= 3) {
				score += 35;
				reasons.push('⚡ Due within 3 days');
			} else if (daysUntilDue <= 7) {
				score += 25;
				reasons.push('📅 Due within a week');
			}

			// Priority factor (0-30 points)
			switch (task.priority) {
				case TaskPriority.HIGH:
					score += 30;
					reasons.push('‼️ High priority');
					break;
				case TaskPriority.MEDIUM:
					score += 20;
					reasons.push('❗ Medium priority');
					break;
				case TaskPriority.LOW:
					score += 10;
					reasons.push('ℹ️ Low priority');
					break;
			}

			return {
				task,
				score,
				reason: reasons.join(', ')
			};
		});

		// Sort by score descending
		scoredTasks.sort((a, b) => b.score - a.score);

		const embed = new EmbedBuilder()
			.setTitle('📋 Suggested Task Order')
			.setDescription('Here\'s the recommended order to complete your tasks:')
			.setColor('#00ff00')
			.setTimestamp();

		scoredTasks.forEach((scoredTask, index) => {
			const task = scoredTask.task;
			const deadline = task.deadline.toLocaleDateString();
			
			embed.addFields({
				name: `${index + 1}. ${task.title}`,
				value: `Due: ${deadline}\n${scoredTask.reason}\nPriority Score: ${scoredTask.score}`
			});
		});

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error in suggestTaskOrder:', error);
		await interaction.reply('Failed to generate task suggestions');
	}
}
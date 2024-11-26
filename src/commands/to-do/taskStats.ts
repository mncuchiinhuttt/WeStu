import { Task, TaskStatus, TaskPriority } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function taskStats(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.taskStats;

	try {
		const userId = interaction.user.id;
		const now = new Date();
		const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

		// Get all tasks from last 30 days
		const tasks = await Task.find({
			userId,
			createdAt: { $gte: thirtyDaysAgo }
		});

		const stats = {
			total: tasks.length,
			completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
			pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
			overdue: tasks.filter(t => 
				t.status === TaskStatus.PENDING && t.deadline < now
			).length,
			priorities: {
				high: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
				medium: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
				low: tasks.filter(t => t.priority === TaskPriority.LOW).length
			},
			avgCompletionTime: calculateAvgCompletionTime(tasks),
			subjectBreakdown: getSubjectBreakdown(tasks),
			onTimeCompletion: calculateOnTimeCompletion(tasks)
		};

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setColor('#0099ff')
			.addFields(
				{ 
					name: strings.overview.title,
					value: [
						`${strings.overview.total}: ${stats.total}`,
						`${strings.overview.completed}: ${stats.completed} (${Math.round(stats.completed/stats.total * 100)}%)`,
						`${strings.overview.pending}: ${stats.pending}`,
						`${strings.overview.overdue}: ${stats.overdue}`
					].join('\n')
				},
				{
					name: strings.priority.title,
					value: [
						`${strings.priority.high}: ${stats.priorities.high}`,
						`${strings.priority.medium}: ${stats.priorities.medium}`,
						`${strings.priority.low}: ${stats.priorities.low}`
					].join('\n')
				},
				{
					name: strings.performance.title,
					value: [
						`${strings.performance.avgCompletion}: ${stats.avgCompletionTime} ${strings.performance.days}`,
						`${strings.performance.onTimeRate}: ${stats.onTimeCompletion}%`
					].join('\n')
				}
			);

		// Add subject breakdown if exists
		if (Object.keys(stats.subjectBreakdown).length > 0) {
			embed.addFields({
				name: strings.subjects.title,
				value: Object.entries(stats.subjectBreakdown)
					.map(([subject, count]) => `${subject}: ${count}`)
					.join('\n')
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: strings.error, ephemeral: true });
	}
}

function calculateAvgCompletionTime(tasks: any[]) {
	const completedTasks = tasks.filter(t => 
		t.status === TaskStatus.COMPLETED && t.completedAt
	);
	
	if (completedTasks.length === 0) return 0;

	const totalDays = completedTasks.reduce((sum, task) => {
		const diff = task.completedAt.getTime() - task.createdAt.getTime();
		return sum + (diff / (1000 * 60 * 60 * 24)); // Convert to days
	}, 0);

	return Math.round((totalDays / completedTasks.length) * 10) / 10;
}

function getSubjectBreakdown(tasks: any[]) {
	return tasks.reduce((acc: {[key: string]: number}, task) => {
		if (task.subject) {
			acc[task.subject] = (acc[task.subject] || 0) + 1;
		}
		return acc;
	}, {});
}

function calculateOnTimeCompletion(tasks: any[]) {
	const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
	if (completedTasks.length === 0) return 100;

	const onTimeTasks = completedTasks.filter(t => 
		t.completedAt <= t.deadline
	);

	return Math.round((onTimeTasks.length / completedTasks.length) * 100);
}
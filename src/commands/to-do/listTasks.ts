import { Task, TaskStatus } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';
import { replacePlaceholders } from '../../utils/replacePlaceholders';

export async function listTasks(interaction: any) {
	const filter = interaction.options.getString('filter') ?? 'all';
	const userId = interaction.user.id;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(userId);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.listTasks;

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
			.setTitle(strings.title)
			.setColor('#0099ff');

		if (tasks.length === 0) {
			embed.setDescription(strings.notFound);
		} else {
			tasks.forEach(task => {
				const dueDate = task.deadline.toLocaleDateString();
				const status = task.status === TaskStatus.COMPLETED ? '✅' : '⏳';
				const progress = task.progress ? `[${task.progress}%] ` : '';
				const recurring = task.recurringFrequency ? `🔄 ${task.recurringFrequency} ` : '';
				const category = task.category ? `📁 ${task.category} ` : '';
				const tags = task.tags?.length ? `🏷️ ${task.tags.join(', ')} ` : '';
				
				let fieldValue = [
					`${strings.dueDate}: ${dueDate}`,
					task.description ? `${strings.description}: ${task.description}` : null,
					`${strings.progress}: ${progress}`,
					category ? `${strings.category}: ${category}` : null,
					tags ? `${strings.tags}: ${tags}` : null,
					`ID: ${task._id}`
				].filter(Boolean).join('\n');

				// Add subtasks if any
				if (task.subtasks?.length > 0) {
					fieldValue += `\n${strings.subtasks}:\n` + task.subtasks.map((st: any) => 
						`${st.completed ? '✓' : '○'} ${st.title}`
					).join('\n');
				}

				// Add shared users if any
				if (task.sharedWith?.length > 0) {
					fieldValue += '\n' + replacePlaceholders(strings.shared, { count: `${task.sharedWith.length}` });
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
		await interaction.reply(strings.error);
	}
}
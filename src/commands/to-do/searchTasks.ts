import { EmbedBuilder } from 'discord.js';
import { Task } from '../../models/TaskModel';
import { LanguageService } from '../../utils/LanguageService';

export async function searchTasks(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.searchTasks;

	try {
		const query = interaction.options.getString('query');
		const tasks = await Task.find({
			userId: interaction.user.id,
			$or: [
				{ title: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } },
				{ tags: { $regex: query, $options: 'i' } }
			]
		}).sort({ deadline: 1 });

		const embed = new EmbedBuilder()
			.setTitle(`🔍 ${strings.title}: "${query}"`)
			.setColor('#0099ff');

		if (tasks.length === 0) {
			embed.setDescription(strings.notFound);
		} else {
			tasks.forEach(task => {
				embed.addFields({
					name: task.title,
					value: `${strings.dueDate}: ${task.deadline.toLocaleDateString()}\n${strings.status}: ${task.status}\nID: ${task._id}`
				});
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: strings.error, ephemeral: true });
	}
}
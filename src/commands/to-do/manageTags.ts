import { Task } from '../../models/TaskModel';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function manageTags(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.manageTags;

	try {
		const taskId = interaction.options.getString('task_id');
		const tagsString = interaction.options.getString('tags');
		
		const task = await Task.findOne({
			_id: taskId,
			userId: interaction.user.id
		});

		if (!task) {
			await interaction.reply({ content: strings.notFound, ephemeral: true });
			return;
		}

		const tags: string[] = tagsString.split(',').map((tag: string) => tag.trim());
		task.tags = tags;
		await task.save();

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle(strings.updated)
			.setDescription(`✅ ${strings.description} **${task.title}**`)
			.addFields({ name: strings.tags, value: tags.join(', '), inline: false });

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: strings.error, ephemeral: true });
	}
}
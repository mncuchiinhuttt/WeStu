import { Task } from '../../models/TaskModel';
import { LanguageService } from '../../utils/LanguageService';
import { replacePlaceholders } from '../../utils/replacePlaceholders';

export async function manageCategories(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.manageCategories;

	try {
		const action = interaction.options.getString('action');
		const name = interaction.options.getString('name');
		const taskId = interaction.options.getString('task_id');

		switch (action) {
			case 'create':
				await Task.create({
					userId: interaction.user.id,
					title: name,
					category: name,
					deadline: new Date()
				});
				await interaction.reply({ content: `✅ ${strings.successCreate}: ${name}`, ephemeral: true });
				break;

			case 'move':
				const task = await Task.findOne({
					_id: taskId,
					userId: interaction.user.id
				});

				if (!task) {
					await interaction.reply({ content: strings.notFound, ephemeral: true });
					return;
				}

				task.category = name;
				await task.save();
				await interaction.reply({ content: `✅ ${strings.successMove}: ${name}`, ephemeral: true });
				break;
		}

	} catch (error) {
		console.error(error);
		await interaction.reply({ content: strings.error, ephemeral: true });
	}
}
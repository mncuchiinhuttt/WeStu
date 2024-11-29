import { Task, TaskStatus } from '../../models/TaskModel';
import { LanguageService } from '../../utils/LanguageService';
import { replacePlaceholders } from '../../utils/replacePlaceholders';

export async function deleteOldTasks(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const path = langStrings.commands.todo.deleteOldTasks;

	try {
		await interaction.deferReply({ ephemeral: true });

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 250);

		// Find tasks to delete
		const tasksToDelete = await Task.find({
			userId: interaction.user.id,
			status: TaskStatus.COMPLETED,
			completedAt: { $lt: thirtyDaysAgo }
		});

		if (tasksToDelete.length === 0) {
			await interaction.editReply(path.lengthError);
			return;
		}

		// Delete tasks
		const result = await Task.deleteMany({
			userId: interaction.user.id,
			status: TaskStatus.COMPLETED,
			completedAt: { $lt: thirtyDaysAgo }
		});

		await interaction.editReply(
			replacePlaceholders(path.success, { deletedCount: `${result.deletedCount}` })
		);

	} catch (error) {
		console.error(error);
		await interaction.editReply(path.error);
	}
}
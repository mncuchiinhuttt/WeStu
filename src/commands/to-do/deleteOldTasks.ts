import { Task, TaskStatus } from '../../models/Task';

export async function deleteOldTasks(interaction: any) {
	try {
		await interaction.deferReply({ ephemeral: true });

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// Find tasks to delete
		const tasksToDelete = await Task.find({
			userId: interaction.user.id,
			status: TaskStatus.COMPLETED,
			completedAt: { $lt: thirtyDaysAgo }
		});

		if (tasksToDelete.length === 0) {
			await interaction.editReply('No old tasks to delete');
			return;
		}

		// Delete tasks
		const result = await Task.deleteMany({
			userId: interaction.user.id,
			status: TaskStatus.COMPLETED,
			completedAt: { $lt: thirtyDaysAgo }
		});

		await interaction.editReply(
			`🗑️ Deleted ${result.deletedCount} completed tasks older than 30 days`
		);

	} catch (error) {
		console.error(error);
		await interaction.editReply('Failed to delete old tasks');
	}
}
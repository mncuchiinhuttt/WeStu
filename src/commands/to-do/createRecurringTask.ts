import { Task } from '../../models/Task';

export async function createRecurringTask(interaction: any) {
	try {
		const title = interaction.options.getString('title');
		const frequency = interaction.options.getString('frequency');
		
		const baseTask = await Task.create({
			userId: interaction.user.id,
			title,
			recurringFrequency: frequency,
			status: 'pending',
			deadline: calculateNextDeadline(frequency)
		});

		await interaction.reply(`✅ Created recurring task: **${title}**`);
		
	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to create recurring task');
	}
}

function calculateNextDeadline(frequency: string): Date {
	const now = new Date();
	switch (frequency) {
		case 'daily':
			return new Date(now.setDate(now.getDate() + 1));
		case 'weekly':
			return new Date(now.setDate(now.getDate() + 7));
		case 'monthly':
			return new Date(now.setMonth(now.getMonth() + 1));
		default:
			return now;
	}
}
import { Task } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

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

		const embed = new EmbedBuilder()
			.setColor('#00FF00')
			.setTitle('Recurring Task Created')
			.setDescription(`✅ Created recurring task: **${title}**`)
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
		
	} catch (error) {
		console.error(error);
		const embed = new EmbedBuilder()
			.setColor('#FF0000')
			.setTitle('Error')
			.setDescription('Failed to create recurring task')
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
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
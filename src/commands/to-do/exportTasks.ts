import { AttachmentBuilder } from 'discord.js';
import { Task } from '../../models/Task';

export async function exportTasks(interaction: any) {
	try {
		await interaction.deferReply({ ephemeral: true });

		const tasks = await Task.find({ userId: interaction.user.id });
		
		let csv = 'Title,Status,Priority,Deadline,Tags\n';
		tasks.forEach(task => {
			csv += `"${task.title}","${task.status}","${task.priority}","${task.deadline.toISOString()}","${task.tags?.join(';')}"\n`;
		});

		const buffer = Buffer.from(csv, 'utf-8');
		const attachment = new AttachmentBuilder(buffer, { name: 'tasks.csv' });

		await interaction.editReply({ 
			content: '📤 Here are your tasks:',
			files: [attachment],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply('Failed to export tasks');
	}
}
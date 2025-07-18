import { AttachmentBuilder } from 'discord.js';
import { Task } from '../../models/TaskModel';
import { LanguageService } from '../../utils/LanguageService';

export async function exportTasks(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.todo.exportTasks;

	try {
	  await interaction.deferReply({ ephemeral: true });
  
	  const tasks = await Task.find({ userId: interaction.user.id });
	  
	  let csv = [
		'Title',
		'Status',
		'Priority',
		'Deadline',
		'Progress',
		'Category',
		'Tags',
		'Subtasks',
		'SharedWith',
		'RecurringFrequency',
		'Description',
		'Created',
		'Completed'
	  ].join(',') + '\n';
  
	  tasks.forEach(task => {
		csv += [
		  `"${task.title}"`,
		  `"${task.status}"`,
		  `"${task.priority}"`,
		  `"${task.deadline.toISOString()}"`,
		  `"${task.progress || 0}"`,
		  `"${task.category || ''}"`,
		  `"${task.tags?.join(';') || ''}"`,
		  `"${task.subtasks?.map((st: any) => `${st.title}(${st.completed ? 'Done' : 'Pending'})`).join(';') || ''}"`,
		  `"${task.sharedWith?.length || 0} users"`,
		  `"${task.recurringFrequency || ''}"`,
		  `"${task.description || ''}"`,
		  `"${task.createdAt?.toISOString() || ''}"`,
		  `"${task.completedAt?.toISOString() || ''}"`,
		].join(',') + '\n';
	  });
  
	  const buffer = Buffer.from(csv, 'utf-8');
	  const attachment = new AttachmentBuilder(buffer, { name: 'tasks.csv' });
  
	  await interaction.editReply({ 
		content: `📤 ${strings.success}:`,
		files: [attachment],
		ephemeral: true
	  });
	} catch (error) {
	  console.error(error);
	  await interaction.editReply(strings.error);
	}
  }
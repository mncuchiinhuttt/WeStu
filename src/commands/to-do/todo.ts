import { SlashCommandBuilder } from 'discord.js';
import { addTask } from './addTask';
import { listTasks } from './listTasks';
import { completeTask } from './completeTask';
import { deleteTask } from './deleteTask';
import { taskStats } from './taskStats';
import { suggestTaskOrder } from './suggestTaskOrder';
import { editTask } from './editTask';
import { searchTasks } from './searchTasks';
import { createRecurringTask } from './createRecurringTask';
import { exportTasks } from './exportTasks';
import { manageTags } from './manageTags';
import { manageSubtasks } from './manageSubtasks';
import { updateProgress } from './updateProgress';
import { shareTask } from './shareTask';
import { manageCategories } from './manageCategories';
import { addComment } from './addComment';
import { showComments } from './showComments';
import { createFromTemplate } from './createFromTemplate';
import { saveTemplate } from './saveTemplate';
import { showTemplates } from './showTemplates';
import { deleteOldTasks } from './deleteOldTasks';

async function run ({ interaction }: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		add: addTask, 
		list: listTasks,
		complete: completeTask,
		stats: taskStats,
		delete: deleteTask,
		suggest: suggestTaskOrder,
		edit: editTask,
		search: searchTasks,
		recurring: createRecurringTask,
		export: exportTasks,
		tags: manageTags,
		subtask: manageSubtasks,
		progress: updateProgress,
		share: shareTask,
		category: manageCategories,
		comment: addComment,
		'show-comments': showComments,
		'save-template': saveTemplate,
		'from-template': createFromTemplate,
		'show-templates': showTemplates,
		'delete-old': deleteOldTasks,
	};
	try {
		await handlers[subCommand](interaction);
	} catch (error) {
		console.log(`Error in ${subCommand}:`, error);
		await interaction.reply('Failed to execute command');
	}
};

const data = new SlashCommandBuilder()
	.setName('todo')
	.setDescription('Functions for to-do list')
	.addSubcommand(subCommand => 
		subCommand
		.setName('add')
		.setDescription('Add a task to your to-do list')
		.addStringOption(option => 
			option
			.setName('title')
			.setDescription('Task title')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('deadline')  
			.setDescription('Task deadline (YYYY-MM-DD HH:mm)')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('priority')
			.setDescription('Task priority')
			.addChoices(
				{ name: 'Low', value: 'low' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'High', value: 'high' }
			)
		)
		.addStringOption(option =>
			option
			.setName('subject')
			.setDescription('Subject/Course')
		)
		.addStringOption(option =>
			option
			.setName('description')
			.setDescription('Task description')
		)
		.addBooleanOption(option => 
			option
			.setName('reminder')
			.setDescription('Set a reminder for this task')
		)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('list')
		.setDescription('List your tasks')
		.addStringOption(option =>
			option
			.setName('filter')
			.setDescription('Filter tasks')
			.addChoices(
				{ name: 'All', value: 'all' },
				{ name: 'Pending', value: 'pending' },
				{ name: 'Completed', value: 'completed' },
				{ name: 'Overdue', value: 'overdue' },
				{ name: 'Due Soon', value: 'due_soon' }
			)
		)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('complete')
		.setDescription('Mark a task as completed')
		.addStringOption(option =>
			option
			.setName('task_id') 
			.setDescription('ID of the task')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('stats')
		.setDescription('View your task statistics')
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('delete')
		.setDescription('Delete a task')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('ID of the task')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('suggest')
		.setDescription('Get suggestions on which tasks to do first')
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('edit')
		.setDescription('Edit an existing task')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to edit')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('New title')
		)
		.addStringOption(option => 
			option
			.setName('deadline')
			.setDescription('New deadline (YYYY-MM-DD HH:mm)')
		)
		.addStringOption(option =>
			option
			.setName('priority')
			.setDescription('New priority')
			.addChoices(
			{ name: 'Low', value: 'low' },
			{ name: 'Medium', value: 'medium' },
			{ name: 'High', value: 'high' }
			)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('search')
		.setDescription('Search tasks')
		.addStringOption(option =>
			option
			.setName('query')
			.setDescription('Search term')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('recurring')
		.setDescription('Create a recurring task')
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('Task title')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('frequency')
			.setDescription('Repeat frequency')
			.setRequired(true)
			.addChoices(
			{ name: 'Daily', value: 'daily' },
			{ name: 'Weekly', value: 'weekly' },
			{ name: 'Monthly', value: 'monthly' }
			)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('export')
		.setDescription('Export your tasks as CSV')
	)
	.addSubcommand(subcommand =>
		subcommand 
		.setName('tags')
		.setDescription('Add/remove tags from a task')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to tag')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('tags')
			.setDescription('Comma-separated tags')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('subtask')
		.setDescription('Add/remove subtasks')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Parent task ID')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('action')
			.setDescription('Action to perform')
			.setRequired(true)
			.addChoices(
				{ name: 'Add subtask', value: 'add' },
				{ name: 'Remove subtask', value: 'remove' },
				{ name: 'Complete subtask', value: 'complete' }
			)
		)
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('Subtask title')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('progress')
		.setDescription('Update task progress')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addIntegerOption(option =>
			option
			.setName('percentage')
			.setDescription('Progress percentage (0-100)')
			.setRequired(true)
			.setMinValue(0)
			.setMaxValue(100)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('share')
		.setDescription('Share task with other users')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to share')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('User to share with')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('category')
		.setDescription('Manage task categories')
		.addStringOption(option =>
			option
			.setName('action')
			.setDescription('Action to perform')
			.setRequired(true)
			.addChoices(
				{ name: 'Create category', value: 'create' },
				{ name: 'Move task to category', value: 'move' }
			)
		)
		.addStringOption(option =>
			option
			.setName('name')
			.setDescription('Category name')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('comment')
		.setDescription('Add a comment to a task')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('content')
			.setDescription('Comment content')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('show-comments')
		.setDescription('Show all comments for a task')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('save-template')
		.setDescription('Save task as template')
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to save as template')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('name')
			.setDescription('Template name')
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('from-template')
		.setDescription('Create task from template')
		.addStringOption(option =>
			option
			.setName('template_name')
			.setDescription('Template to use')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('show-templates')
		.setDescription('Show all your saved task templates')
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('delete-old')
		.setDescription('Delete completed tasks older than 30 days')
	);

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
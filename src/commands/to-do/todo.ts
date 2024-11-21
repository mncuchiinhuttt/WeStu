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

async function run ({ interaction }: any) {
	const subCommand = interaction.options.getSubcommand();
	switch (subCommand) {
		case 'add':
			await addTask(interaction);
			break;
		case 'list':
			await listTasks(interaction);
			break;
		case 'complete':
			await completeTask(interaction);
			break;
		case 'stats':
			await taskStats(interaction);
			break;
		case 'delete':
			await deleteTask(interaction);
			break;
		case 'suggest':
			await suggestTaskOrder(interaction);
			break;
		case 'edit':
			await editTask(interaction);
			break;
		case 'search':
			await searchTasks(interaction);
			break;
		case 'recurring':
			await createRecurringTask(interaction);
			break;
		case 'export':
			await exportTasks(interaction);
			break;
		case 'tags':
			await manageTags(interaction);
			break;
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
	);

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
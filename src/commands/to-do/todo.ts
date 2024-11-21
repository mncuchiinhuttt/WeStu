import { SlashCommandBuilder } from 'discord.js';
import { addTask } from './addTask';
import { listTasks } from './listTasks';
import { completeTask } from './completeTask';
import { deleteTask } from './deleteTask';
import { taskStats } from './taskStats';
import { suggestTaskOrder } from './suggestTaskOrder';

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

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
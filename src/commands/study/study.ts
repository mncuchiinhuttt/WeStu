import { SlashCommandBuilder } from 'discord.js';
import { schedule_session } from './scheduleSession';
import { manageStudySession } from './studySession';
import { getRecentStudySessions } from './getRecentStudySessions';
import { deleteOldSessions } from './deleteOldSessions';
import { setStudyTarget } from './setStudyTarget';
import { reviewStudy } from './reviewStudy';
import { startPomodoro } from './pomodoro';
import { manageGoals } from './manageGoals';
import { manageStreak } from './streakManager';

async function run ({
	interaction,
}: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		'schedule': schedule_session,
		'session': manageStudySession,
		'recent-sessions': getRecentStudySessions,
		'delete-old-sessions': deleteOldSessions,
		'set-target': setStudyTarget,
		'review': reviewStudy,
		'pomodoro': startPomodoro,
		'goal': manageGoals,
		'streak': manageStreak,
	};

	try {
		await handlers[subCommand](interaction);
	} catch (error) {
		console.error(`Error in ${subCommand}:`, error);
		await interaction.reply({
			content: 'An error occurred while processing your request',
			ephemeral: true
		});
	}
};

const data = new SlashCommandBuilder()
	.setName('study')
	.setDescription('Functions for studying')
	.addSubcommand(subCommand =>
		subCommand
		.setName('schedule')
		.setDescription('Schedule a study session')
		.addStringOption(option =>
			option
			.setName('topic')
			.setDescription('The topic to study')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('time')
			.setDescription('The time for the session (in HH:MM format)')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('date')
			.setDescription('The date for the session (in YYYY-MM-DD format)')
			.setRequired(true)
		)
		.addUserOption(option =>
			option 
			.setName('participant1')
			.setDescription('The first participant')
			.setRequired(false)
		)
		.addUserOption(option =>
			option
			.setName('participant2')
			.setDescription('The second participant')
			.setRequired(false)
		)
		.addUserOption(option =>
			option
			.setName('participant3')
			.setDescription('The third participant')
			.setRequired(false)
		)
		.addUserOption(option => 
			option
			.setName('participant4')
			.setDescription('The fourth participant')
			.setRequired(false)
		)
		.addUserOption(option =>
			option
			.setName('participant5')
			.setDescription('The fifth participant')
			.setRequired(false)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('session')
		.setDescription('Start a study session (click button to finish)')
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('recent-sessions')
			.setDescription('Get your recent study sessions')
			.addStringOption(option =>
				option
					.setName('period')
					.setDescription('Period to view')
					.setRequired(true)
					.addChoices(
						{ name: '7 Days', value: '7' },
						{ name: '30 Days', value: '30' },
						{ name: '180 Days', value: '180' }
					)
			)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('delete-old-sessions')
		.setDescription('Delete study sessions older than 250 days')
	)
	.addSubcommand(subCommand => 
		subCommand 
		.setName('set-target')
		.setDescription('Set your study target')
		.addNumberOption(option =>
			option
			.setName('weekly_hours')
			.setDescription('The number of hours you want to study per week')
			.setRequired(true)
		)
		.addNumberOption(option => 
			option
			.setName('daily_minimum')
			.setDescription('The minimum number of hours you want to study per day')
			.setRequired(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('review')
		.setDescription('Review your study statistics')
	)
	.addSubcommand(subcommand =>
  	subcommand
    .setName('pomodoro')
    .setDescription('Start a Pomodoro study session')
    .addIntegerOption(option =>
      option
			.setName('duration')
			.setDescription('Study duration in minutes (default: 25)')
			.setRequired(false)
    )
    .addIntegerOption(option =>
      option
			.setName('break')
			.setDescription('Break duration in minutes (default: 5)')
			.setRequired(false)
    )
    .addIntegerOption(option =>
      option
			.setName('sessions')
			.setDescription('Number of Pomodoro sessions (default: 1)')
			.setRequired(false)
			.setMinValue(1)
			.setMaxValue(10)
    )
	)
	.addSubcommand(subcommand =>
	 subcommand
		.setName('goal')
		.setDescription('Manage study goals')
		.addStringOption(option =>
			option
			.setName('action')
			.setDescription('Action to perform')
			.setRequired(true)
			.addChoices(
				{ name: 'Set new goal', value: 'set' },
				{ name: 'View goals', value: 'view' },
				{ name: 'Update progress', value: 'update' },
				{ name: 'Add milestone', value: 'milestone' }
			)
		)
		.addStringOption(option =>
			option
			.setName('description')
			.setDescription('Goal description')
			.setRequired(false)
		)
		.addStringOption(option =>
			option
			.setName('category')
			.setDescription('Goal category')
			.setRequired(false)
			.addChoices(
				{ name: 'Daily', value: 'daily' },
				{ name: 'Weekly', value: 'weekly' },
				{ name: 'Monthly', value: 'monthly' },
				{ name: 'Custom', value: 'custom' }
			)
		)
		.addNumberOption(option =>
			option
			.setName('target_hours')
			.setDescription('Target study hours')
			.setRequired(false)
		)
		.addStringOption(option =>
			option
			.setName('priority')
			.setDescription('Goal priority')
			.setRequired(false)
			.addChoices(
				{ name: 'Low', value: 'low' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'High', value: 'high' }
			)
		)
		.addStringOption(option =>
			option
			.setName('deadline')
			.setDescription('Goal deadline (YYYY-MM-DD)')
			.setRequired(false)
		)
		.addBooleanOption(option =>
			option
			.setName('recurring')
			.setDescription('Make goal recurring')
			.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName('milestone_action')
				.setDescription('Milestone action')
				.setRequired(false)
				.addChoices(
					{ name: 'Add milestone', value: 'add' },
					{ name: 'Update progress', value: 'update' },
					{ name: 'View milestones', value: 'view' }
				)
		)
		.addStringOption(option =>
			option
				.setName('milestone_id')
				.setDescription('Milestone ID (for updates)')
				.setRequired(false)
		)
		.addNumberOption(option =>
			option
				.setName('target_value')
				.setDescription('Milestone target hours')
				.setRequired(false)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('streak')
		.setDescription('View your study streak and achievements')
		.addStringOption(option =>
			option
			.setName('period')
			.setDescription('Period to view')
			.setRequired(true)
			.addChoices(
				{ name: '30 Days', value: '30' },
				{ name: '180 Days', value: '180' }
			)
		)
	)

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
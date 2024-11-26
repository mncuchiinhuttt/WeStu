import { SlashCommandBuilder } from 'discord.js';
import { manageStudySession } from './studySession';
import { getRecentStudySessions } from './getRecentStudySessions';
import { deleteOldSessions } from './deleteOldSessions';
import { setStudyTarget } from './setStudyTarget';
import { reviewStudy } from './reviewStudy';
import { startPomodoro } from './pomodoro';
import { manageGoals } from './manageGoals';
import { manageStreak } from './streakManager';
import { manageResources } from './resources';
import { exportStudyData } from './exportStudyData';
import { displayLeaderboard } from './leaderboard';
import { dailyStudySummary } from './dailySummary';
import { displayAchievements } from './achievements';
import { addVirtualSession } from './addVirtualSession';
import { studyTips } from './studyTips';

async function run ({
	interaction,
}: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		'session': manageStudySession,
		'recent-sessions': getRecentStudySessions,
		'delete-old-sessions': deleteOldSessions,
		'set-target': setStudyTarget,
		'review': reviewStudy,
		'pomodoro': startPomodoro,
		'goal': manageGoals,
		'streak': manageStreak,
		'resources': manageResources,
		'export': exportStudyData,
		'leaderboard': displayLeaderboard,
		'daily-summary': dailyStudySummary,
		'achievements': displayAchievements,
		'add-virtual-session': addVirtualSession,
		'tips': studyTips
	};

	if (subCommand === 'goal' && interaction.user.id !== '936234981167104031') {
		await interaction.reply({
			content: 'This command is only available to the bot owner',
			ephemeral: true
		});
		return;
	}

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
		.setName('session')
		.setDescription('Start a study session (click button to finish)')
		.addStringOption(option =>
			option
			.setName('schedule')
			.setDescription('Schedule the study session start time (format: YYYY-MM-DD HH:MM)')
			.setRequired(false)
		)
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
			.addStringOption(option =>
				option
					.setName('period')
					.setDescription('Period to review')
					.setRequired(true)
					.addChoices(
						{ name: '7 Days', value: '7' },
						{ name: '30 Days', value: '30' },
						{ name: '180 Days', value: '180' }
					)
			)
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
	.addSubcommand((subCommand) =>
    subCommand
      .setName('resources')
      .setDescription('Manage study resources')
      .addStringOption((option) =>
        option
          .setName('action')
          .setDescription('Action to perform')
          .setRequired(true)
          .addChoices(
            { name: 'Add Resource', value: 'add' },
            { name: 'View Resources', value: 'view' },
            { name: 'Delete Resource', value: 'delete' } 
          )
      )
      .addStringOption((option) =>
        option
          .setName('title')
          .setDescription('Title of the resource')
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName('description')
          .setDescription('Description of the resource')
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName('link')
          .setDescription('Link to the resource or uploaded file')
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName('share')
          .setDescription('Share with server? (Default: false)')
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName('resource_id')
          .setDescription('ID of the resource to delete')
          .setRequired(false)
					.setAutocomplete(true)
      )
  )
	.addSubcommand(subcommand =>
    subcommand
      .setName('export')
      .setDescription('Export study data')
      .addStringOption(option =>
        option
          .setName('format')
          .setDescription('Export format')
          .setRequired(true)
          .addChoices(
            { name: 'CSV', value: 'csv' },
            { name: 'PDF Report', value: 'pdf' },
            { name: 'Calendar', value: 'calendar' }
          )
      )
  )
	.addSubcommand(subcommand =>
		subcommand
		.setName('leaderboard')
		.setDescription('View the study leaderboard')
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('daily-summary')
		.setDescription('View your daily study summary')
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('achievements')
		.setDescription('View your earned achievements')
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('add-virtual-session')
			.setDescription('Admin: Add a virtual study session with specified start and end times')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('User to assign the study session')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('Research topic')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('begin_time')
					.setDescription('Begin time (YYYY-MM-DD HH:MM)')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('finish_time')
					.setDescription('Finish time (YYYY-MM-DD HH:MM)')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('tips')
		.setDescription('Get a random study tip')
		.setDescriptionLocalizations({
			'vi': 'Nhận một mẹo học tập ngẫu nhiên'
		})
	)

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
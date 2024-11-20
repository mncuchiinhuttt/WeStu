import { SlashCommandBuilder } from 'discord.js';
import { schedule_session } from './scheduleSession';
import { study_help } from './studyHelp';
import { start_session } from './startSession';
import { finish_session } from './finishSession';
import { getRecentStudySessions } from './getRecentStudySessions';
import { deleteOldSessions } from './deleteOldSessions';
import { setStudyTarget } from './setStudyTarget';
import { reviewStudy } from './reviewStudy';

async function run ({
  interaction,
}: any) {
  const subCommand = interaction.options.getSubcommand();
	if (subCommand === 'schedule') {
		schedule_session({ interaction });
	} else if (subCommand === 'help') {
		study_help({ interaction });
	} else if (subCommand === 'start-session') {
		start_session({ interaction });
	} else if (subCommand === 'finish-session') {
		finish_session({ interaction });
	} else if (subCommand === 'recent-sessions') {
		getRecentStudySessions({ interaction });
	} else if (subCommand === 'delete-old-sessions') {
		deleteOldSessions({ interaction });
	} else if (subCommand === 'set-target') {
		setStudyTarget(interaction);
	} else if (subCommand === 'review') {
		reviewStudy({ interaction });
	}
};

const data = new SlashCommandBuilder()
	.setName('study')
	.setDescription('Functions for studying')
	.addSubcommand(subCommand =>
		subCommand
		.setName('help')
		.setDescription('Get help with using the study command')
	)
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
		.setName('start-session')
		.setDescription('Start a study session')
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('finish-session')
		.setDescription('Finish a study session')
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('recent-sessions')
		.setDescription('Get your study sessions from the past 7 days')
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('delete-old-sessions')
		.setDescription('Delete study sessions older than 30 days')
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

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
import { SlashCommandBuilder } from 'discord.js';
import { schedule_session } from './schedule-session';
import { study_help } from './study_help';

async function run ({
  interaction,
}: any) {
  const subCommand = interaction.options.getSubcommand();
	if (subCommand === 'schedule') {
		schedule_session({ interaction });
	} else if (subCommand === 'help') {
		study_help({ interaction });
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
	);

const options = {
  devOnly: true,
}

module.exports = {
  data,
  run,
  options
}
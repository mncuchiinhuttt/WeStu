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
		study_help();
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
	);

const options = {
  devOnly: true,
}

module.exports = {
  data,
  run,
  options
}
import { SlashCommandBuilder } from 'discord.js';
import { schedule_session } from './schedule-session';
import { study_help } from './study_help';
import { create_flashcard } from './create-flashcard';
import { get_flashcard } from './get-flashcard';
import { quiz } from './quiz';

async function run ({
  interaction,
}: any) {
  const subCommand = interaction.options.getSubcommand();
	if (subCommand === 'schedule') {
		schedule_session({ interaction });
	} else if (subCommand === 'help') {
		study_help({ interaction });
	} else if (subCommand === 'create-flashcard') {
		create_flashcard(interaction);
	} else if (subCommand === 'get-flashcard') {
		get_flashcard({ interaction });
	} else if (subCommand === 'quiz') {
		quiz({ interaction });
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
		.setName('create-flashcard')
		.setDescription('Create your own flashcard.')
		.addStringOption(option =>
			option
			.setName('question')
			.setDescription('The question for the flashcard')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('answer')
			.setDescription('The answer for the flashcard')
			.setRequired(true)
		)
		.addBooleanOption(option =>
			option
			.setName('visibility')
			.setDescription('Whether your flashcard is public or private.')
			.setRequired(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('get-flashcard')
		.setDescription('Get a flashcard from Trivia API')
		.addStringOption(option =>
			option
			.setName('amount')
			.setDescription('The number of flashcards to get')
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('category')
			.setDescription('The category of the flashcard')
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('quiz')
		.setDescription('Take a quiz with a random flashcard or trivia question.')
	);

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
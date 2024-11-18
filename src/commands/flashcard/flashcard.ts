import { SlashCommandBuilder, ChatInputCommandInteraction as Interaction } from 'discord.js';
import { create_flashcard } from './create-flashcard';
import { Visibility } from '../../models/Flashcard';
import { quiz } from './quiz';


export async function run({ interaction }: any) {
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "create":
			create_flashcard(interaction);
			break;

		case "quiz":
			quiz(interaction);
			break;
	}
}

export const data = new SlashCommandBuilder()
	.setName('flashcard')
	.setDescription("Create and manage your own private/server's public flashcards")
	.addSubcommand(subcommand =>
		subcommand
			.setName('create')
			.setDescription('Create your own flashcard.')
			.addStringOption(option =>
				option
					.setName('question')
					.setDescription('The question for the flashcard')
					.setRequired(true)
					.setMaxLength(900)
			)
			.addStringOption(option =>
				option
					.setName('answer')
					.setDescription('The answer for the flashcard')
					.setRequired(true)
					.setMaxLength(900)
			)
			.addBooleanOption(option =>
				option
					.setName('is_public')
					.setDescription('Whether your flashcard is public or private.')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('The topic for the flashcard')
					.setRequired(false)
					.setMaxLength(100)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('quiz')
			.setDescription("Take a quiz from your own/the server's public flashcards.")
			.addIntegerOption(option =>
				option
					.setName('visibility')
					.setDescription("Whether to search for only your own flashcards, the server's public flashcards or both")
					.setRequired(true)
					.addChoices(
						{ name: "Only my own flashcards", value: Visibility.Private },
						{ name: "Only the server's public flashcards", value: Visibility.Public },
						{ name: "Both my own and the server's public flashcards", value: Visibility.PrivateAndPublic }
					)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('The topic to search for')
					.setRequired(false)
					.setMaxLength(100)
			)
	);

export const options = {
	devOnly: true,
};
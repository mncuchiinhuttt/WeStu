import { SlashCommandBuilder, ChatInputCommandInteraction as Interaction } from 'discord.js';
import { create_flashcard } from './create-flashcard';


export async function run({ interaction }: any) {
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "create":
			create_flashcard(interaction);
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
					.setMaxLength(1900)
			)
			.addStringOption(option =>
				option
					.setName('answer')
					.setDescription('The answer for the flashcard')
					.setRequired(true)
					.setMaxLength(1900)
			)
			.addBooleanOption(option =>
				option
					.setName('is_public')
					.setDescription('Whether your flashcard is public or private.')
					.setRequired(true)
			)
	);

export const options = {
	devOnly: false,
};
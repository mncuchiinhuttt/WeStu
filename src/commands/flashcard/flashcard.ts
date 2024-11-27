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
	.setDescriptionLocalizations({
		'vi': 'Tạo và quản lý flashcard cá nhân/công khai của server'
	})
	.addSubcommand(subcommand =>
		subcommand
			.setName('create')
			.setDescription('Create your own flashcard.')
			.addStringOption(option =>
				option
					.setName('question')
					.setDescription('The question for the flashcard')
					.setDescriptionLocalizations({
						'vi': 'Câu hỏi cho flashcard'
					})
					.setRequired(true)
					.setMaxLength(900)
			)
			.addStringOption(option =>
				option
					.setName('answer')
					.setDescription('The answer for the flashcard')
					.setDescriptionLocalizations({
						'vi': 'Câu trả lời cho flashcard'
					})
					.setRequired(true)
					.setMaxLength(900)
			)
			.addBooleanOption(option =>
				option
					.setName('is_public')
					.setDescription('Whether your flashcard is public or private.')
					.setDescriptionLocalizations({
						'vi': 'Flashcard của bạn là công khai hay cá nhân.'
					})
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('The topic for the flashcard')
					.setDescriptionLocalizations({
						'vi': 'Chủ đề cho flashcard'
					})
					.setRequired(false)
					.setMaxLength(100)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('quiz')
			.setDescription("Take a quiz from your own/the server's public flashcards.")
			.setDescriptionLocalizations({
				'vi': 'Tham gia bài kiểm tra từ flashcard cá nhân/công khai của server'
			})
			.addIntegerOption(option =>
				option
					.setName('visibility')
					.setDescription("Whether to search for only your own flashcards, the server's public flashcards or both")
					.setDescriptionLocalizations({
						'vi': 'Chỉ tìm kiếm flashcard của bạn, flashcard công khai của server hoặc cả hai'
					})
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
					.setDescriptionLocalizations({
						'vi': 'Chủ đề cần tìm kiếm'
					})
					.setRequired(false)
					.setMaxLength(100)
			)
	);

export const options = {
	devOnly: false,
};
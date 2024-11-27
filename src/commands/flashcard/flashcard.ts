import { SlashCommandBuilder, ChatInputCommandInteraction as Interaction } from 'discord.js';
import { create_flashcard } from './create-flashcard';
import { Visibility } from '../../models/Flashcard';
import { quiz } from './quiz';
import { review } from './review';


export async function run({ interaction }: any) {
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "create":
			create_flashcard(interaction);
			break;

		case "quiz":
			quiz(interaction);
			break;

		case "review":
			review(interaction);
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
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('review')
			.setDescription("Review your own, your study group's or the server's public flashcards.")
			.setDescriptionLocalizations({
				'vi': 'Xem lại flashcard cá nhân, nhóm học tập hoặc flashcard công khai của server'
			})
			.addIntegerOption(option => 
				option
					.setName('quantity')
					.setDescription('The number of flashcards to review')
					.setDescriptionLocalizations({
						'vi': 'Số lượng flashcard cần xem lại'
					})
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(200)
			)
			.addIntegerOption(option =>
				option
					.setName('visibility')
					.setDescription("Whether to search for your own, your study group's, the server's public flashcards or all")
					.setDescriptionLocalizations({
						'vi': 'Chỉ tìm kiếm flashcard của bạn, nhóm học tập của bạn, flashcard công khai của server hoặc tất cả'
					})
					.setRequired(true)
					.addChoices(
						{ name: "Only my own flashcards", value: Visibility.Private },
						// { name: "Only my study group's flashcards", value: Visibility.Group },
						{ name: "Only the server's public flashcards", value: Visibility.Public },
						// { name: "All", value: Visibility.All }
					)
			)
			.addStringOption(option =>
				option
					.setName('group_id')
					.setDescription('The ID of the study group to search flashcards for')
					.setDescriptionLocalizations({
						'vi': 'ID của nhóm học tập để tìm kiếm flashcard'
					})
					.setRequired(false)
					.setAutocomplete(true)
			)
			// Nên kiểm tra lại autocomplete cho group_id
	);

export const options = {
	devOnly: false,
};
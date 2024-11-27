import { SlashCommandBuilder, ChatInputCommandInteraction as Interaction } from 'discord.js';
import { create_flashcard } from './create-flashcard';
import { Visibility } from '../../models/Flashcard';
import { quiz } from './quiz';
import { deleteFlashcard } from './deleteFlashcard';
import { shareFlashcard } from './shareFlashcard';
import { listFlashcards } from './listFlashcards';
import { showFlashcard } from './showFlashcard';
import { importHelp } from './importHelp';
import { importFlashcards } from './importFlashcards';

export async function run({ interaction }: any) {
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "create":
			create_flashcard(interaction);
			break;
		case "quiz":
			quiz(interaction);
			break;
		case 'delete':
			deleteFlashcard(interaction);
			break;
		case 'share':
			shareFlashcard(interaction);
			break;
		case 'list':
			listFlashcards(interaction);
			break;
		case 'show':
			showFlashcard(interaction);
			break;
		case 'import-help':
			importHelp(interaction);
			break;
		case 'import':
			importFlashcards(interaction);
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
						{ name: "Both my own and the server's public flashcards", value: Visibility.PrivateAndPublic },
						{ name: "Only my groups' flashcards", value: Visibility.GroupShared }
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
		.setName('delete')
		.setDescription('Delete your own flashcard')
		.setDescriptionLocalizations({
			'vi': 'Xóa flashcard của bạn'
		})
		.addStringOption(option =>
			option
				.setName('flashcard_id')
				.setDescription('The ID of the flashcard to delete')
				.setDescriptionLocalizations({
					'vi': 'ID của flashcard cần xóa'
				})
				.setRequired(true)
				.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('share')
		.setDescription('Share your own flashcard')
		.setDescriptionLocalizations({
			'vi': 'Chia sẻ flashcard của bạn'
		})
		.addStringOption(option =>
			option
			.setName('flashcard_id')
			.setDescription('The ID of the flashcard to share')
			.setDescriptionLocalizations({
				'vi': 'ID của flashcard cần chia sẻ'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('group_id')
			.setDescription('The ID of the group to share the flashcard with')
			.setDescriptionLocalizations({
				'vi': 'ID của nhóm cần chia sẻ flashcard'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('list')
		.setDescription('List your own flashcards')
		.setDescriptionLocalizations({
			'vi': 'Liệt kê flashcard của bạn'
		})
		.addIntegerOption(option =>
			option
			.setName('visibility')
			.setDescription('Filter by visibility type')
			.addChoices(
				{ name: 'My flashcards', value: Visibility.Private },
				{ name: 'Public flashcards', value: Visibility.Public },
				{ name: 'Group flashcards', value: Visibility.GroupShared },
				{ name: 'All accessible', value: -1 }
			)
		)
		.addIntegerOption(option =>
			option
			.setName('page')	
			.setDescription('The page number to view')
			.setDescriptionLocalizations({
				'vi': 'Trang cần xem'
			})
			.setRequired(false)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('show')
		.setDescription('Show a flashcard')
		.setDescriptionLocalizations({
			'vi': 'Hiển thị flashcard'
		})
		.addStringOption(option =>
			option
			.setName('flashcard_id_show')
			.setDescription('The ID of the flashcard to show')
			.setDescriptionLocalizations({
				'vi': 'ID của flashcard cần hiển thị'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('import')
		.setDescription('Import flashcards from a file')
		.setDescriptionLocalizations({
			'vi': 'Nhập flashcard từ file'
		})
		.addAttachmentOption(option =>
			option
				.setName('file')
				.setDescription('Text file containing flashcards')
				.setDescriptionLocalizations({
					'vi': 'File chứa flashcard'
				})
				.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('import-help')
		.setDescription('Get help with importing flashcards from a text file')
		.setDescriptionLocalizations({
			'vi': 'Hướng dẫn cách nhập flashcard từ file văn bản'
		})
	)

export const options = {
	devOnly: false,
};
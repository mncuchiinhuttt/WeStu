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
import { exportFlashcards } from './exportFlashcards';
import { addTag, removeTag } from './tagManagement';
import { Difficulty } from '../../models/Flashcard';
import { listTags } from './listTags';

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
		case 'export':
			exportFlashcards(interaction);
			break;
	}

	const groupSubcommand = interaction.options.getSubcommandGroup(false);
	switch (groupSubcommand) {
		case 'tag':
			const subcommand = interaction.options.getSubcommand();
			switch (subcommand) {
				case 'add':
					addTag(interaction);
					break;
				case 'remove':
					removeTag(interaction);
					break;
				case 'list':
					listTags(interaction);
					break;
			}
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
			.addStringOption(option =>
				option
				.setName('hints')
				.setDescription('Comma-separated hints for the flashcard')
				.setDescriptionLocalizations({
					'vi': 'Gợi ý cho flashcard, cách nhau bởi dấu phẩy'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('examples')
				.setDescription('Comma-separated examples for the flashcard')
				.setDescriptionLocalizations({
					'vi': 'Ví dụ cho flashcard, cách nhau bởi dấu phẩy'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('tag_id')
				.setDescription('Select a tag for the flashcard')
				.setDescriptionLocalizations({
					'vi': 'Chọn tag cho flashcard'
				})
				.setRequired(false)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('difficulty')
				.setDescription('The difficulty of the flashcard')
				.setDescriptionLocalizations({
					'vi': 'Độ khó của flashcard'
				})
				.setRequired(false)
				.addChoices(
					{ name: 'Easy', value: Difficulty.Easy },
					{ name: 'Medium', value: Difficulty.Medium },
					{ name: 'Hard', value: Difficulty.Hard }
				)
			)
			.addAttachmentOption(option =>
				option
				.setName('media')
				.setDescription('Attach an image or audio file to the flashcard')
				.setDescriptionLocalizations({
					'vi': 'Đính kèm hình ảnh hoặc file âm thanh cho flashcard'
				})
				.setRequired(false)
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
	.addSubcommand(subcommand =>
		subcommand
		.setName('export')
		.setDescription('Export flashcards to a file')
		.setDescriptionLocalizations({
			'vi': 'Xuất flashcard ra file'
		})
		.addStringOption(option =>
			option
			.setName('format')
			.setDescription('The format to export the flashcards in')
			.setDescriptionLocalizations({
				'vi': 'Định dạng xuất flashcard'
			})
			.setRequired(true)
			.addChoices(
				{ name: 'Text File', value: 'txt' },
				{ name: 'CSV', value: 'csv' },
				{ name: 'Excel', value: 'xlsx' }
			)
		)
		.addIntegerOption(option =>
			option
			.setName('visibility')
			.setDescription('The visibility of the flashcards to export')
			.setDescriptionLocalizations({
				'vi': 'Loại flashcard cần xuất'
			})
			.setRequired(true)
			.addChoices(
				{ name: 'My flashcards', value: Visibility.Private },
				{ name: 'Public flashcards', value: Visibility.Public },
				{ name: 'All flashcards', value: -1 }
			)
		)
	)
	.addSubcommandGroup(group =>
		group
		.setName('tag')
		.setDescription('Manage flashcard tags')
		.setDescriptionLocalizations({
			'vi': 'Quản lý tag flashcard'
		})
		.addSubcommand(subcommand =>
			subcommand
			.setName('add')
			.setDescription('Add a tag')
			.setDescriptionLocalizations({
				'vi': 'Thêm tag'
			})
			.addStringOption(option =>
				option
				.setName('name')
				.setDescription('The name of the tag')
				.setDescriptionLocalizations({
					'vi': 'Tên của tag'
				})
				.setRequired(true)
				.setMaxLength(50)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('remove')
			.setDescription('Remove a tag')
			.setDescriptionLocalizations({
				'vi': 'Xóa tag'
			})
			.addStringOption(option =>
				option
				.setName('tag_id')
				.setDescription('The ID of the tag to remove')
				.setDescriptionLocalizations({
					'vi': 'ID của tag cần xóa'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('list')
			.setDescription('List all tags')
			.setDescriptionLocalizations({
				'vi': 'Liệt kê tất cả tag'
			})
			.addIntegerOption(option =>
				option
				.setName('page')
				.setDescription('Page number')
				.setDescriptionLocalizations({
					'vi': 'Số trang'
				})
				.setMinValue(1)
			)
		)
	)

export const options = {
	devOnly: false,
};
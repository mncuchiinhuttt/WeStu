import { SlashCommandBuilder } from 'discord.js';
import { create_flashcard } from './create-flashcard';
import { Visibility } from '../../models/FlashcardModel';
import { quiz } from './quiz';
import { deleteFlashcard } from './deleteFlashcard';
import { shareFlashcard } from './shareFlashcard';
import { listFlashcards } from './listFlashcards';
import { showFlashcard } from './showFlashcard';
import { importHelp } from './importHelp';
import { importFlashcards } from './importFlashcards';
import { exportFlashcards } from './exportFlashcards';
import { addTag, removeTag } from './tagManagement';
import { Difficulty } from '../../models/FlashcardModel';
import { listTags } from './listTags';
import { createTest } from './test/createTest';
import { deleteTest } from './test/deleteTest';
import { addQuestion } from './test/addQuestion';
import { listQuestion } from './test/listQuestion';
import { changeSettings } from './test/changeSettings';
import { takeTest } from './test/takeTest';
import { listTest } from './test/listTest';
import { testStats } from './test/testStats';
import { removeQuestion } from './test/removeQuestion';
import { editQuestion } from './test/editQuestion';
import { eachTestStats } from './test/eachTestStats';
import { incorrectReview } from './test/incorrectReview';
import { shareTest } from './test/shareTest';
import { unshareTest } from './test/unshareTest';

export async function run({ interaction }: any) {
	const groupSubcommand = interaction.options.getSubcommandGroup(false);
	switch (groupSubcommand) {
		case 'tag':
			const tagFunction = interaction.options.getSubcommand();
			switch (tagFunction) {
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

		case 'test':
			const testFunction = interaction.options.getSubcommand();
			switch (testFunction) {
				case 'create':
					createTest(interaction);
					break;
				case 'delete':
					deleteTest(interaction);
					break;
				case 'add-question':
					addQuestion(interaction);
					break;
				case 'list-question':
					listQuestion(interaction);
					break;
				case 'settings':
					changeSettings(interaction);
					break;
				case 'do':
					takeTest(interaction);
					break;
				case 'list':
					listTest(interaction);
					break;
				case 'stats':
					testStats(interaction);
					break;
				case 'remove-question':
					removeQuestion(interaction);
					break;
				case 'edit-question':
					editQuestion(interaction);
					break;
				case 'test-stats':
					eachTestStats(interaction);
					break;
				case 'incorrect-review':
					incorrectReview(interaction);
					break;
				case 'share':
					shareTest(interaction);
					break;
				case 'unshare':
					unshareTest(interaction);
					break;
			}
			break;
	}

	if (groupSubcommand) return;

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
	.addSubcommandGroup(group =>
		group
		.setName('test')
		.setDescription('All commands related to flashcard tests')
		.setDescriptionLocalizations({
			'vi': 'Tất cả các lệnh liên quan đến bài kiểm tra sử dụng flashcard'
		})
		.addSubcommand(subcommand =>
			subcommand
			.setName('create')
			.setDescription('Create a test')
			.setDescriptionLocalizations({
				'vi': 'Tạo bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('title')
				.setDescription('The title of the test')	
				.setDescriptionLocalizations({
					'vi': 'Tiêu đề của bài kiểm tra'
				})
				.setRequired(true)
			)
			.addIntegerOption(option =>
				option
				.setName('visibility')
				.setDescription('The visibility of the test')
				.setDescriptionLocalizations({
					'vi': 'Loại bài kiểm tra'
				})
				.setRequired(true)
				.addChoices(
					{ name: 'Public', value: Visibility.Public },
					{ name: 'Private', value: Visibility.Private }
				)
			)
			.addStringOption(option =>
				option
				.setName('description')
				.setDescription('The description of the test')
				.setDescriptionLocalizations({
					'vi': 'Mô tả của bài kiểm tra'
				})
				.setRequired(false)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('delete')
			.setDescription('Delete a test')
			.setDescriptionLocalizations({
				'vi': 'Xóa bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to delete')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần xóa'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('add-question')
			.setDescription('Add a question to a test')
			.setDescriptionLocalizations({
				'vi': 'Thêm câu hỏi vào bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to add a question to')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần thêm câu hỏi'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('flashcard_id')
				.setDescription('The ID of the flashcard to add as a question')
				.setDescriptionLocalizations({
					'vi': 'ID của flashcard cần thêm làm câu hỏi'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addIntegerOption(option =>
				option
				.setName('points')
				.setDescription('The points for the question (1 - 10)')
				.setDescriptionLocalizations({
					'vi': 'Số điểm cho câu hỏi (1 - 10)'
				})
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(10)
			)
			.addStringOption(option =>
				option
				.setName('choice1')
				.setDescription('The first choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ nhất cho câu hỏi'
				})
				.setRequired(true)
			)
			.addStringOption(option =>
				option
				.setName('choice2')
				.setDescription('The second choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ hai cho câu hỏi'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice3')
				.setDescription('The third choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ ba cho câu hỏi'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice4')
				.setDescription('The fourth choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ tư cho câu hỏi'
				})
				.setRequired(false)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('list-question')
			.setDescription('List all questions in a test')
			.setDescriptionLocalizations({
				'vi': 'Liệt kê tất cả câu hỏi trong bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')	
				.setDescription('The ID of the test to list questions')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần liệt kê câu hỏi'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('settings')
			.setDescription('Change test settings')
			.setDescriptionLocalizations({
				'vi': 'Thay đổi cài đặt bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to change settings')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần thay đổi cài đặt'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('title')
				.setDescription('The title of the test')
				.setDescriptionLocalizations({
					'vi': 'Tiêu đề của bài kiểm tra'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('description')
				.setDescription('The description of the test')
				.setDescriptionLocalizations({
					'vi': 'Mô tả của bài kiểm tra'
				})
				.setRequired(false)
			)
			.addIntegerOption(option =>
				option
				.setName('time_limit')
				.setDescription('The time limit for the test (in minutes)')
				.setDescriptionLocalizations({
					'vi': 'Thời gian giới hạn cho bài kiểm tra (tính bằng phút)'
				})
				.setRequired(false)
			)
			.addIntegerOption(option =>
				option
				.setName('passing_score')
				.setDescription('The passing score for the test')
				.setDescriptionLocalizations({
					'vi': 'Điểm qua môn cho bài kiểm tra'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('tag_id')
				.setDescription('The tag for the test')
				.setDescriptionLocalizations({
					'vi': 'Tag cho bài kiểm tra'
				})
				.setRequired(false)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('do')
			.setDescription('Take a test')
			.setDescriptionLocalizations({
				'vi': 'Tham gia bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to take')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần tham gia'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('list')
			.setDescription('List all tests')	
			.setDescriptionLocalizations({
				'vi': 'Liệt kê tất cả bài kiểm tra'
			})
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('stats')
			.setDescription('View your test stats')
			.setDescriptionLocalizations({
				'vi': 'Xem thống kê bài kiểm tra'
			})
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('remove-question')
			.setDescription('Remove a question from a test')
			.setDescriptionLocalizations({
				'vi': 'Xóa câu hỏi khỏi bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to remove a question from')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần xóa câu hỏi'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('question_id')
				.setDescription('The ID of the question to remove')
				.setDescriptionLocalizations({
					'vi': 'ID của câu hỏi cần xóa'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('edit-question')
			.setDescription('Edit a question in a test')
			.setDescriptionLocalizations({
				'vi': 'Chỉnh sửa câu hỏi trong bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to edit a question in')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần chỉnh sửa câu hỏi'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('question_id')
				.setDescription('The ID of the question to edit')
				.setDescriptionLocalizations({
					'vi': 'ID của câu hỏi cần chỉnh sửa'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addIntegerOption(option =>
				option
				.setName('points')
				.setDescription('The points for the question (1 - 10)')
				.setDescriptionLocalizations({
					'vi': 'Số điểm cho câu hỏi (1 - 10)'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice1')
				.setDescription('The first choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ nhất cho câu hỏi'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice2')
				.setDescription('The second choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ hai cho câu hỏi'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice3')
				.setDescription('The third choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ ba cho câu hỏi'
				})
				.setRequired(false)
			)
			.addStringOption(option =>
				option
				.setName('choice4')
				.setDescription('The fourth choice for the question')
				.setDescriptionLocalizations({
					'vi': 'Lựa chọn thứ tư cho câu hỏi'
				})
				.setRequired(false)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('test-stats')
			.setDescription('View your test stats')
			.setDescriptionLocalizations({
				'vi': 'Xem thống kê bài kiểm tra'
			})
			.addStringOption(option =>
				option
				.setName('test_id')
				.setDescription('The ID of the test to view stats')
				.setDescriptionLocalizations({
					'vi': 'ID của bài kiểm tra cần xem thống kê'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('incorrect-review')
			.setDescription('Review incorrect answers')
			.setDescriptionLocalizations({
				'vi': 'Xem lại câu trả lời sai'
			})
			.addStringOption(option =>
				option
				.setName('session_id')
				.setDescription('The ID of the test session to review')
				.setDescriptionLocalizations({
					'vi': 'ID của lần làm bài cần xem lại'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('share')
			.setDescription('Share the test with your group')
			.setDescriptionLocalizations({
				'vi': 'Chia sẻ bài kiểm tra với nhóm của bạn'
			})
			.addStringOption(option =>
				option
				.setName('your_test_id')
				.setDescription('Your test ID')
				.setDescriptionLocalizations({
					'vi': 'ID bài test của bạn'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('group_id')
				.setDescription('Your group ID')
				.setDescriptionLocalizations({
					'vi': 'ID nhóm của bạn'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
		.addSubcommand(subcommand =>
			subcommand
			.setName('unshare')
			.setDescription('Unshare the test with your group')
			.setDescriptionLocalizations({
				'vi': 'Bỏ chia sẻ bài kiểm tra với nhóm của bạn'
			})
			.addStringOption(option =>
				option
				.setName('your_test_id')
				.setDescription('Your test ID')
				.setDescriptionLocalizations({
					'vi': 'ID bài test của bạn'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
			.addStringOption(option =>
				option
				.setName('group_id')
				.setDescription('Your group ID')
				.setDescriptionLocalizations({
					'vi': 'ID nhóm của bạn'
				})
				.setRequired(true)
				.setAutocomplete(true)
			)
		)
	)

export const options = {
	devOnly: false,
};
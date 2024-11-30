import { SlashCommandBuilder } from 'discord.js';
import { addTask } from './addTask';
import { listTasks } from './listTasks';
import { completeTask } from './completeTask';
import { deleteTask } from './deleteTask';
import { taskStats } from './taskStats';
import { suggestTaskOrder } from './suggestTaskOrder';
import { editTask } from './editTask';
import { searchTasks } from './searchTasks';
import { createRecurringTask } from './createRecurringTask';
import { exportTasks } from './exportTasks';
import { manageTags } from './manageTags';
import { manageSubtasks } from './manageSubtasks';
import { updateProgress } from './updateProgress';
import { shareTask } from './shareTask';
import { addComment } from './addComment';
import { showComments } from './showComments';
import { createFromTemplate } from './createFromTemplate';
import { saveTemplate } from './saveTemplate';
import { showTemplates } from './showTemplates';
import { deleteOldTasks } from './deleteOldTasks';

async function run ({ interaction }: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		'add': addTask, 
		'list': listTasks,
		'complete': completeTask,
		'stats': taskStats,
		'delete': deleteTask,
		'suggest': suggestTaskOrder,
		'edit': editTask,
		'search': searchTasks,
		'recurring': createRecurringTask,
		'export': exportTasks,
		'tags': manageTags,
		'subtask': manageSubtasks,
		'progress': updateProgress,
		'share': shareTask,
		'comment': addComment,
		'show-comments': showComments,
		'save-template': saveTemplate,
		'from-template': createFromTemplate,
		'show-templates': showTemplates,
		'delete-old': deleteOldTasks,
	};
	try {
		await handlers[subCommand](interaction);
	} catch (error) {
		console.log(`Error in ${subCommand}:`, error);
		await interaction.reply('Failed to execute command');
	}
};

const data = new SlashCommandBuilder()
	.setName('todo')
	.setDescription('Functions for to-do list')
	.setDescriptionLocalizations({
		'vi': 'Chức năng cho danh sách công việc'
	})
	.addSubcommand(subCommand => 
		subCommand
		.setName('add')
		.setDescription('Add a task to your to-do list')
		.setDescriptionLocalizations({
			'vi': 'Thêm công việc vào danh sách công việc'
		})
		.addStringOption(option => 
			option
			.setName('title')
			.setDescription('Task title')
			.setDescriptionLocalizations({
				'vi': 'Tiêu đề công việc'
			})
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('deadline')  
			.setDescription('Task deadline (YYYY-MM-DD HH:mm)')
			.setDescriptionLocalizations({
				'vi': 'Hạn chót công việc (YYYY-MM-DD HH:mm)'
			})
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('priority')
			.setDescription('Task priority')
			.setDescriptionLocalizations({
				'vi': 'Mức độ ưu tiên công việc'
			})
			.addChoices(
				{ name: 'Low', value: 'low' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'High', value: 'high' }
			)
		)
		.addStringOption(option =>
			option
			.setName('subject')
			.setDescription('Subject/Course')
			.setDescriptionLocalizations({
				'vi': 'Môn học'
			})
		)
		.addStringOption(option =>
			option
			.setName('description')
			.setDescription('Task description')
			.setDescriptionLocalizations({
				'vi': 'Mô tả công việc'
			})
		)
		.addBooleanOption(option => 
			option
			.setName('reminder')
			.setDescription('Set a reminder for this task')
			.setDescriptionLocalizations({
				'vi': 'Đặt nhắc nhở cho công việc này'
			})
		)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('list')
		.setDescription('List your tasks')
		.setDescriptionLocalizations({
			'vi': 'Liệt kê công việc'
		})
		.addStringOption(option =>
			option
			.setName('filter')
			.setDescription('Filter tasks')
			.setDescriptionLocalizations({
				'vi': 'Lọc công việc'
			})
			.addChoices(
				{ name: 'All', value: 'all' },
				{ name: 'Pending', value: 'pending' },
				{ name: 'Completed', value: 'completed' },
				{ name: 'Overdue', value: 'overdue' },
				{ name: 'Due Soon', value: 'due_soon' }
			)
		)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('complete')
		.setDescription('Mark a task as completed')
		.setDescriptionLocalizations({
			'vi': 'Đánh dấu công việc đã hoàn thành'
		})
		.addStringOption(option =>
			option
			.setName('task_id') 
			.setDescription('ID of the task')
			.setDescriptionLocalizations({
				'vi': 'ID công việc'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('stats')
		.setDescription('View your task statistics')
		.setDescriptionLocalizations({
			'vi': 'Xem thống kê công việc'
		})
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('delete')
		.setDescription('Delete a task')
		.setDescriptionLocalizations({
			'vi': 'Xóa công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('ID of the task')
			.setDescriptionLocalizations({
				'vi': 'ID công việc'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
		.setName('suggest')
		.setDescription('Get suggestions on which tasks to do first')
		.setDescriptionLocalizations({
			'vi': 'Gợi ý công việc nên làm trước'
		})
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('edit')
		.setDescription('Edit an existing task')
		.setDescriptionLocalizations({
			'vi': 'Chỉnh sửa công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to edit')
			.setDescriptionLocalizations({
				'vi': 'Công việc cần chỉnh sửa'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('New title')
			.setDescriptionLocalizations({
				'vi': 'Tiêu đề mới'
			})
		)
		.addStringOption(option => 
			option
			.setName('deadline')
			.setDescription('New deadline (YYYY-MM-DD HH:mm)')
			.setDescriptionLocalizations({
				'vi': 'Hạn chót mới (YYYY-MM-DD HH:mm)'
			})
		)
		.addStringOption(option =>
			option
			.setName('priority')
			.setDescription('New priority')
			.setDescriptionLocalizations({
				'vi': 'Mức độ ưu tiên mới'
			})
			.addChoices(
			{ name: 'Low', value: 'low' },
			{ name: 'Medium', value: 'medium' },
			{ name: 'High', value: 'high' }
			)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('search')
		.setDescription('Search tasks')
		.setDescriptionLocalizations({
			'vi': 'Tìm kiếm công việc'
		})
		.addStringOption(option =>
			option
			.setName('query')
			.setDescription('Search term')
			.setDescriptionLocalizations({
				'vi': 'Từ khóa tìm kiếm'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('recurring')
		.setDescription('Create a recurring task')
		.setDescriptionLocalizations({
			'vi': 'Tạo công việc lặp lại'
		})
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('Task title')
			.setDescriptionLocalizations({
				'vi': 'Tiêu đề công việc'
			})
			.setRequired(true)
		)
		.addStringOption(option =>
			option
			.setName('frequency')
			.setDescription('Repeat frequency')
			.setDescriptionLocalizations({
				'vi': 'Tần suất lặp lại'
			})
			.setRequired(true)
			.addChoices(
			{ name: 'Daily', value: 'daily' },
			{ name: 'Weekly', value: 'weekly' },
			{ name: 'Monthly', value: 'monthly' }
			)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('export')
		.setDescription('Export your tasks as CSV')
		.setDescriptionLocalizations({
			'vi': 'Xuất công việc dưới dạng CSV'
		})
	)
	.addSubcommand(subcommand =>
		subcommand 
		.setName('tags')
		.setDescription('Add/remove tags from a task')
		.setDescriptionLocalizations({
			'vi': 'Thêm/xóa thẻ cho công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to tag')
			.setDescriptionLocalizations({
				'vi': 'Công việc cần thêm thẻ'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('tags')
			.setDescription('Comma-separated tags')
			.setDescriptionLocalizations({
				'vi': 'Danh sách thẻ cách nhau bởi dấu phẩy'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('subtask')
		.setDescription('Add/remove subtasks')
		.setDescriptionLocalizations({
			'vi': 'Thêm/xóa công việc con'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Parent task ID')
			.setDescriptionLocalizations({
				'vi': 'ID công việc cha'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('action')
			.setDescription('Action to perform')
			.setDescriptionLocalizations({
				'vi': 'Hành động cần thực hiện'
			})
			.setRequired(true)
			.addChoices(
				{ name: 'Add subtask', value: 'add' },
				{ name: 'Remove subtask', value: 'remove' },
				{ name: 'Complete subtask', value: 'complete' }
			)
		)
		.addStringOption(option =>
			option
			.setName('title')
			.setDescription('Subtask title')
			.setDescriptionLocalizations({
				'vi': 'Tiêu đề công việc con'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('progress')
		.setDescription('Update task progress')
		.setDescriptionLocalizations({
			'vi': 'Cập nhật tiến độ công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setDescriptionLocalizations({
				'vi': 'ID công việc'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addIntegerOption(option =>
			option
			.setName('percentage')
			.setDescription('Progress percentage (0-100)')
			.setDescriptionLocalizations({
				'vi': 'Phần trăm tiến độ (0-100)'
			})
			.setRequired(true)
			.setMinValue(0)
			.setMaxValue(100)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('share')
		.setDescription('Share task with other users')
		.setDescriptionLocalizations({
			'vi': 'Chia sẻ công việc với người khác'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to share')
			.setDescriptionLocalizations({
				'vi': 'Công việc cần chia sẻ'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('User to share with')
			.setDescriptionLocalizations({
				'vi': 'Người dùng cần chia sẻ'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('comment')
		.setDescription('Add a comment to a task')
		.setDescriptionLocalizations({
			'vi': 'Thêm bình luận cho công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setDescriptionLocalizations({
				'vi': 'ID công việc'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('content')
			.setDescription('Comment content')
			.setDescriptionLocalizations({
				'vi': 'Nội dung bình luận'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('show-comments')
		.setDescription('Show all comments for a task')
		.setDescriptionLocalizations({
			'vi': 'Hiển thị tất cả bình luận của công việc'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task ID')
			.setDescriptionLocalizations({
				'vi': 'ID công việc'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('save-template')
		.setDescription('Save task as template')
		.setDescriptionLocalizations({
			'vi': 'Lưu công việc dưới dạng mẫu'
		})
		.addStringOption(option =>
			option
			.setName('task_id')
			.setDescription('Task to save as template')
			.setDescriptionLocalizations({
				'vi': 'Công việc cần lưu'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
			.setName('name')
			.setDescription('Template name')
			.setDescriptionLocalizations({
				'vi': 'Tên mẫu'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('from-template')
		.setDescription('Create task from template')
		.setDescriptionLocalizations({
			'vi': 'Tạo công việc từ mẫu'
		})
		.addStringOption(option =>
			option
			.setName('template_name')
			.setDescription('Template to use')
			.setDescriptionLocalizations({
				'vi': 'Mẫu sử dụng'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('show-templates')
		.setDescription('Show all your saved task templates')
		.setDescriptionLocalizations({
			'vi': 'Hiển thị tất cả mẫu công việc đã lưu'
		})
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('delete-old')
		.setDescription('Delete completed tasks older than 250 days')
		.setDescriptionLocalizations({
			'vi': 'Xóa công việc đã hoàn thành cũ hơn 250 ngày'
		})
	);

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
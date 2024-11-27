import { SlashCommandBuilder } from 'discord.js';
import { manageStudySession } from './studySession';
import { getRecentStudySessions } from './getRecentStudySessions';
import { deleteOldSessions } from './deleteOldSessions';
import { setStudyTarget } from './setStudyTarget';
import { reviewStudy } from './reviewStudy';
import { startPomodoro } from './pomodoro';
import { manageStreak } from './streakManager';
import { manageResources } from './resources';
import { exportStudyData } from './exportStudyData';
import { displayLeaderboard } from './leaderboard';
import { dailyStudySummary } from './dailySummary';
import { displayAchievements } from './achievements';
import { addVirtualSession } from './addVirtualSession';
import { studyTips } from './studyTips';

async function run ({
	interaction,
}: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		'session': manageStudySession,
		'recent-sessions': getRecentStudySessions,
		'delete-old-sessions': deleteOldSessions,
		'set-target': setStudyTarget,
		'review': reviewStudy,
		'pomodoro': startPomodoro,
		'streak': manageStreak,
		'resources': manageResources,
		'export': exportStudyData,
		'leaderboard': displayLeaderboard,
		'daily-summary': dailyStudySummary,
		'achievements': displayAchievements,
		'add-virtual-session': addVirtualSession,
		'tips': studyTips
	};

	try {
		await handlers[subCommand](interaction);
	} catch (error) {
		console.error(`Error in ${subCommand}:`, error);
		await interaction.reply({
			content: 'An error occurred while processing your request',
			ephemeral: true
		});
	}
};

const data = new SlashCommandBuilder()
	.setName('study')
	.setDescription('Functions for studying')
	.setDescriptionLocalizations({
		'vi': 'Các chức năng học tập'
	})
	.addSubcommand(subCommand =>
		subCommand
		.setName('session')
		.setDescription('Start a study session (click button to finish)')
		.setDescriptionLocalizations({
			'vi': 'Bắt đầu một phiên học (nhấn nút để kết thúc)'
		})
		.addStringOption(option =>
			option
			.setName('schedule')
			.setDescription('Schedule the study session start time (format: YYYY-MM-DD HH:MM)')
			.setDescriptionLocalizations({
				'vi': 'Lịch trình thời gian bắt đầu phiên học (định dạng: YYYY-MM-DD HH:MM)'
			})
			.setRequired(false)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('recent-sessions')
			.setDescription('Get your recent study sessions')
			.setDescriptionLocalizations({
				'vi': 'Nhận các phiên học gần đây của bạn'
			})
			.addStringOption(option =>
				option
					.setName('period')
					.setDescription('Period to view')
					.setDescriptionLocalizations({
						'vi': 'Khoảng thời gian để xem'
					})
					.setRequired(true)
					.addChoices(
						{ name: '7 Days', value: '7' },
						{ name: '30 Days', value: '30' },
						{ name: '180 Days', value: '180' }
					)
			)
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('delete-old-sessions')
		.setDescription('Delete study sessions older than 250 days')
		.setDescriptionLocalizations({
			'vi': 'Xóa các phiên học cũ hơn 250 ngày'
		})
	)
	.addSubcommand(subCommand => 
		subCommand 
		.setName('set-target')
		.setDescription('Set your study target')
		.setDescriptionLocalizations({
			'vi': 'Đặt mục tiêu học tập của bạn'
		})
		.addNumberOption(option =>
			option
			.setName('weekly_hours')
			.setDescription('The number of hours you want to study per week')
			.setDescriptionLocalizations({
				'vi': 'Số giờ bạn muốn học mỗi tuần'
			})
			.setRequired(true)
		)
		.addNumberOption(option => 
			option
			.setName('daily_minimum')
			.setDescription('The minimum number of hours you want to study per day')
			.setDescriptionLocalizations({
				'vi': 'Số giờ tối thiểu bạn muốn học mỗi ngày'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName('review')
			.setDescription('Review your study statistics')
			.setDescriptionLocalizations({
				'vi': 'Xem xét thống kê học tập của bạn'
			})
			.addStringOption(option =>
				option
					.setName('period')
					.setDescription('Period to review')
					.setDescriptionLocalizations({
						'vi': 'Khoảng thời gian để xem'
					})
					.setRequired(true)
					.addChoices(
						{ name: '7 Days', value: '7' },
						{ name: '30 Days', value: '30' },
						{ name: '180 Days', value: '180' }
					)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('pomodoro')
		.setDescription('Start a Pomodoro study session')
		.setDescriptionLocalizations({
			'vi': 'Bắt đầu một phiên học Pomodoro'
		})
		.addIntegerOption(option =>
			option
			.setName('duration')
			.setDescription('Study duration in minutes (default: 25)')
			.setDescriptionLocalizations({
				'vi': 'Thời lượng học tập trong phút (mặc định: 25)'
			})
			.setRequired(false)
		)
		.addIntegerOption(option =>
			option
			.setName('break')
			.setDescription('Break duration in minutes (default: 5)')
			.setDescriptionLocalizations({
				'vi': 'Thời lượng nghỉ trong phút (mặc định: 5)'
			})
			.setRequired(false)
		)
		.addIntegerOption(option =>
			option
			.setName('sessions')
			.setDescription('Number of Pomodoro sessions (default: 1)')
			.setDescriptionLocalizations({
				'vi': 'Số phiên Pomodoro (mặc định: 1)'
			})
			.setRequired(false)
			.setMinValue(1)
			.setMaxValue(10)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('streak')
		.setDescription('View your study streak and achievements')
		.setDescriptionLocalizations({
			'vi': 'Xem chuỗi học tập và thành tựu của bạn'
		})
		.addStringOption(option =>
			option
			.setName('period')
			.setDescription('Period to view')
			.setDescriptionLocalizations({
				'vi': 'Khoảng thời gian để xem'
			})
			.setRequired(true)
			.addChoices(
				{ name: '30 Days', value: '30' },
				{ name: '180 Days', value: '180' }
			)
		)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName('resources')
			.setDescription('Manage study resources')
			.setDescriptionLocalizations({
				'vi': 'Quản lý tài nguyên học tập'
			})
			.addStringOption((option) =>
				option
					.setName('action')
					.setDescription('Action to perform')
					.setDescriptionLocalizations({
						'vi': 'Hành động để thực hiện'
					})
					.setRequired(true)
					.addChoices(
						{ name: 'Add Resource', value: 'add' },
						{ name: 'View Resources', value: 'view' },
						{ name: 'Delete Resource', value: 'delete' } 
					)
			)
			.addStringOption((option) =>
				option
					.setName('title')
					.setDescription('Title of the resource')
					.setDescriptionLocalizations({
						'vi': 'Tiêu đề của tài nguyên'
					})
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName('description')
					.setDescription('Description of the resource')
					.setDescriptionLocalizations({
						'vi': 'Mô tả của tài nguyên'
					})
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName('link')
					.setDescription('Link to the resource or uploaded file')
					.setDescriptionLocalizations({
						'vi': 'Liên kết đến tài nguyên hoặc tệp đã tải lên'
					})
					.setRequired(false)
			)
			.addBooleanOption((option) =>
				option
					.setName('share')
					.setDescription('Share with server? (Default: false)')
					.setDescriptionLocalizations({
						'vi': 'Chia sẻ với server? (Mặc định: false)'
					})
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName('resource_id')
					.setDescription('ID of the resource to delete')
					.setDescriptionLocalizations({
						'vi': 'ID của tài nguyên để xóa'
					})
					.setRequired(false)
					.setAutocomplete(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('export')
			.setDescription('Export study data')
			.setDescriptionLocalizations({
				'vi': 'Xuất dữ liệu học tập'
			})
			.addStringOption(option =>
				option
					.setName('format')
					.setDescription('Export format')
					.setDescriptionLocalizations({
						'vi': 'Định dạng xuất'
					})
					.setRequired(true)
					.addChoices(
						{ name: 'CSV', value: 'csv' },
						{ name: 'PDF Report', value: 'pdf' },
						{ name: 'Calendar', value: 'calendar' }
					)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('leaderboard')
		.setDescription('View the study leaderboard')
		.setDescriptionLocalizations({
			'vi': 'Xem bảng xếp hạng học tập'
		})
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('daily-summary')
		.setDescription('View your daily study summary')
		.setDescriptionLocalizations({
			'vi': 'Xem tổng kết học tập hàng ngày của bạn'
		})
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('achievements')
		.setDescription('View your earned achievements')
		.setDescriptionLocalizations({
			'vi': 'Xem thành tựu bạn đã đạt được'
		})
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('add-virtual-session')
			.setDescription('Admin: Add a virtual study session with specified start and end times')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('User to assign the study session')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('Research topic')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('begin_time')
					.setDescription('Begin time (YYYY-MM-DD HH:MM)')
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('finish_time')
					.setDescription('Finish time (YYYY-MM-DD HH:MM)')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('tips')
		.setDescription('Get a random study tip')
		.setDescriptionLocalizations({
			'vi': 'Nhận một mẹo học tập ngẫu nhiên'
		})
	)

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
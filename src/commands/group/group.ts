import { SlashCommandBuilder } from 'discord.js';
import { createGroup } from './createGroup';
import { addGroupMember } from './addGroupMember';
import { removeGroupMember } from './removeGroupMember';
import { deleteGroup } from './deleteGroup';
import { getGroups } from './listGroup';

async function run ({
	interaction,
}: any) {
	const subCommand = interaction.options.getSubcommand();
	const handlers: { [key: string]: Function } = {
		'create': createGroup,
		'add': addGroupMember,
		'remove': removeGroupMember,
		'delete': deleteGroup,
		'list': getGroups
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
	.setName('group')
	.setDescription('Functions for group study')
	.setDescriptionLocalizations({
		'vi': 'Các chức năng học nhóm'
	})
  .addSubcommand(subcommand =>
		 subcommand
		 .setName('create')
		 .setDescription('Create a new study group')
		 .setDescriptionLocalizations({
			'vi': 'Tạo một nhóm học mới'
		 })
		 .addStringOption(option =>
			option
			.setName('name')
			.setDescription('Name of the study group')
			.setDescriptionLocalizations({
				'vi': 'Tên của nhóm học'
			})
			.setRequired(true)
		 )
		 .addStringOption(option =>
			option
			.setName('description')	
			.setDescription('Description of the study group')
			.setDescriptionLocalizations({
				'vi': 'Mô tả của nhóm học'
			})
		 )
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('add')
		.setDescription('Add a member to a study group')
		.setDescriptionLocalizations({
			'vi': 'Thêm thành viên vào nhóm học'
		})
		.addStringOption(option =>
			option
			.setName('group_id')
			.setDescription('ID of the study group')
			.setDescriptionLocalizations({
				'vi': 'ID của nhóm học'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('User to add')
			.setDescriptionLocalizations({
				'vi': 'Người dùng cần thêm'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('remove')
		.setDescription('Remove a member from a study group')
		.setDescriptionLocalizations({
			'vi': 'Xóa thành viên khỏi nhóm học'
		})
		.addStringOption(option =>
			option
			.setName('group_id')
			.setDescription('ID of the study group')
			.setDescriptionLocalizations({
				'vi': 'ID của nhóm học'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addUserOption(option =>
			option
			.setName('user')
			.setDescription('User to remove')
			.setDescriptionLocalizations({
				'vi': 'Người dùng cần xóa'
			})
			.setRequired(true)
		)
	)
	.addSubcommand(subcommand => 
		subcommand
		.setName('delete')
		.setDescription('Delete a study group')
		.setDescriptionLocalizations({
			'vi': 'Xóa nhóm học'
		})
		.addStringOption(option =>
			option
			.setName('group_id')
			.setDescription('ID of the study group')
			.setDescriptionLocalizations({
				'vi': 'ID của nhóm học'
			})
			.setRequired(true)
			.setAutocomplete(true)
		)
	)
	.addSubcommand(subcommand =>
		subcommand
		.setName('list')
		.setDescription('List all study groups')
		.setDescriptionLocalizations({
			'vi': 'Liệt kê tất cả nhóm học'
		})
		.addIntegerOption(option =>
			option
			.setName('page')
			.setDescription('Page number')
			.setDescriptionLocalizations({
				'vi': 'Số thứ tự trang'
			})
		)
	)

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
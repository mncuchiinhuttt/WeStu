import { EmbedBuilder } from 'discord.js';
import { StudyGroup } from '../../models/StudyGroup';
import { LanguageService } from '../../utils/LanguageService';

export async function addGroupMember(interaction: any) {
	const groupId = interaction.options.getString('group_id', true);
	const memberId = interaction.options.getUser('user', true).id;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.addGroupMember;

	try {
		const group = await StudyGroup.findById(groupId);
		
		if (!group) {
			await interaction.reply({ content: strings.groupNotFound, ephemeral: true });
			return;
		}

		if (group.ownerId !== interaction.user.id) {
			await interaction.reply({ 
				content: strings.notOwner, 
				ephemeral: true 
			});
			return;
		}

		if (group.members.includes(memberId)) {
			await interaction.reply({ 
				content: strings.alreadyMember, 
				ephemeral: true 
			});
			return;
		}

		group.members.push(memberId);
		await group.save();

		const embed = new EmbedBuilder()
			.setTitle(strings.success.title)
			.setDescription(
				strings.success.description
				.replace('{member}', `<@${memberId}>`)
				.replace('{group}', group.name)
			)
			.setColor('#00ff00')
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });

		const member = await interaction.guild.members.fetch(memberId);
		await member.send({
			content: strings.dm
			.replace('{group}', group.name)
			.replace('{owner}', `<@${group.ownerId}>`)
		});

	} catch (error) {
		console.error('Error adding member:', error);
		await interaction.reply({ 
			content: strings.error, 
			ephemeral: true 
		});
	}
}
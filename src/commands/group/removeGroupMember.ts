import { EmbedBuilder } from 'discord.js';
import { StudyGroup } from '../../models/StudyGroup';
import { LanguageService } from '../../utils/LanguageService';

export async function removeGroupMember(interaction: any) {
	const groupId = interaction.options.getString('group_id', true);
	const memberId = interaction.options.getUser('user', true).id;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.removeGroupMember;

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

		if (memberId === group.ownerId) {
			await interaction.reply({
				content: strings.removeOwner,
				ephemeral: true
			});
			return;
		}

		if (!group.members.includes(memberId)) {
			await interaction.reply({
				content: strings.notMember,
				ephemeral: true
			});
			return;
		}

		group.members = group.members.filter(id => id !== memberId);
		await group.save();

		const embed = new EmbedBuilder()
			.setTitle(strings.success.title)
			.setDescription(
				strings.success.description
				.replace('{member}', `<@${memberId}>`)
				.replace('{group}', group.name)
			)
			.addFields(
				{ name: strings.success.remaining, value: `${group.members.length}`, inline: true }
			)
			.setColor('#ff9900')
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });

		const member = await interaction.guild.members.fetch(memberId);
		await member.send({
			content: strings.dm
			.replace('{group}', group.name)
			.replace('{owner}', `<@${group.ownerId}>`)
		});

	} catch (error) {
		console.error('Error removing member:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
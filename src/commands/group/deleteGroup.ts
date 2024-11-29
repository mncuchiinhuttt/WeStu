import { EmbedBuilder } from 'discord.js';
import { StudyGroup } from '../../models/StudyGroupModel';
import { LanguageService } from '../../utils/LanguageService';

export async function deleteGroup(interaction: any) {
	const groupId = interaction.options.getString('group_id', true);

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.deleteGroup;

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

		const memberIds = group.members;

		await StudyGroup.findByIdAndDelete(groupId);

		const embed = new EmbedBuilder()
			.setTitle(strings.success.title)
			.setDescription(
				strings.success.description
				.replace('{name}', group.name)
			)
			.setColor('#ff0000')
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });

		for (const memberId of memberIds) {
			try {
				const user = await interaction.client.users.fetch(memberId);
				if (user) {
					await user.send(
						strings.groupDeletedMessage
						.replace('{name}', group.name)
						.replace('{owner}', interaction.user.username)
					);
				}
			} catch (err) {
				console.error(`Failed to send message to user ${memberId}:`, err);
			}
		}

	} catch (error) {
		console.error('Error deleting group:', error);
		await interaction.reply({ 
			content: strings.error, 
			ephemeral: true 
		});
	}
}
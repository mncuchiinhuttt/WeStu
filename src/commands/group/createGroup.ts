import { EmbedBuilder } from 'discord.js';
import { StudyGroup } from '../../models/StudyGroupModel';
import { LanguageService } from '../../utils/LanguageService';

export async function createGroup(interaction: any) {
	const name = interaction.options.getString('name', true);
	const description = interaction.options.getString('description');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.createGroup;

	const newGroup = await StudyGroup.create({
		name,
		description,
		ownerId: interaction.user.id,
		members: [interaction.user.id]
	});

	const embed = new EmbedBuilder()
		.setTitle(strings.successTitle)
		.setDescription(
			strings.description
			.replace('{name}', name)
		)
		.addFields(
			{ name: strings.owner, value: `<@${interaction.user.id}>`, inline: true },
			{ name: strings.members, value: '1', inline: true },
			{ name: strings.description2, value: description ?? strings.noDescription, inline: false }
		)
		.setColor('#00ff00');

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
import { EmbedBuilder } from 'discord.js';
import { FlashcardTag } from '../../models/FlashcardTagModel';
import { LanguageService } from '../../utils/LanguageService';
import config from '../../config.json';

export async function addTag(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.tagManagement;

	if (!config.developers.includes(interaction.user.id)) {
		await interaction.reply({ 
			content: strings.notAdmin, 
			ephemeral: true 
		});
		return;
	}

	const name = interaction.options.getString('name', true).toLowerCase();

	try {
		const tag = await FlashcardTag.create({
			name,
			createdBy: interaction.user.id
		});

		const embed = new EmbedBuilder()
			.setTitle('✅ Tag Added')
			.addFields(
				{ name: 'Name', value: tag.name },
				{ name: 'Created by', value: `<@${tag.createdBy}>` }
			)
			.setColor('#00ff00');

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		await interaction.reply({
			content: '❌ Failed to add tag',
			ephemeral: true
		});
	}
}

export async function removeTag(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.tagManagement;

	if (!config.developers.includes(interaction.user.id)) {
		await interaction.reply({
			content: strings.notAdmin,
			ephemeral: true
		});
		return;
	}

	const tagId = interaction.options.getString('tag_id', true);

	try {
		await FlashcardTag.findByIdAndDelete(tagId);
		await interaction.reply({
			content: '✅ Tag removed successfully',
			ephemeral: true
		});
	} catch (error) {
		await interaction.reply({
			content: '❌ Failed to remove tag',
			ephemeral: true
		});
	}
}
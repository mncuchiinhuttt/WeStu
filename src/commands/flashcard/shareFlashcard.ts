import { EmbedBuilder } from 'discord.js';
import { Flashcard, Visibility } from '../../models/Flashcard';
import { StudyGroup } from '../../models/StudyGroup';
import { LanguageService } from '../../utils/LanguageService';

export async function shareFlashcard(interaction: any) {
	const flashcardId = interaction.options.getString('flashcard_id', true);
	const groupId = interaction.options.getString('group_id', true);

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.shareFlashcard;

	try {
		const flashcard = await Flashcard.findById(flashcardId);
		const group = await StudyGroup.findById(groupId);

		if (!flashcard || !group) {
			await interaction.reply({
				content: strings.notFound,
				ephemeral: true
			});
			return;
		}

		if (flashcard.user !== interaction.user.id) {
			await interaction.reply({
				content: strings.notOwner,
				ephemeral: true
			});
			return;
		}

		if (!group.members.includes(interaction.user.id)) {
			await interaction.reply({
				content: strings.notMember,
				ephemeral: true
			});
			return;
		}

		flashcard.visibility = Visibility.GroupShared;
		if (!flashcard.groupIds.includes(groupId)) {
			flashcard.groupIds.push(groupId);
		}
		await flashcard.save();

		const embed = new EmbedBuilder()
			.setTitle(strings.success.title)
			.setDescription(
				strings.success.description
				.replace('{group}', group.name)
			)
			.addFields(
				{ name: strings.success.question, value: flashcard.question },
				{ name: strings.success.topic, value: flashcard.topic ?? strings.success.noTopic }
			)
			.setColor('#00ff00')
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error sharing flashcard:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
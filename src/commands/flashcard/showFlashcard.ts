import { EmbedBuilder } from "discord.js";
import { Flashcard, Visibility, Difficulty } from "../../models/FlashcardModel";
import { StudyGroup } from "../../models/StudyGroupModel";
import moment from 'moment';
import { LanguageService } from "../../utils/LanguageService";
import { FlashcardTag } from "../../models/FlashcardTagModel";

export async function showFlashcard(interaction: any) {
	const flashcardId = interaction.options.getString('flashcard_id_show', true);

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.showFlashcard;

	try {
		const flashcard = await Flashcard.findById(flashcardId);
		if (!flashcard) {
			await interaction.reply({
				content: strings.notFound,
				ephemeral: true
			});
			return;
		}

		const hasAccess = 
			flashcard.user === interaction.user.id ||
			flashcard.visibility === Visibility.Public ||
			(flashcard.visibility === Visibility.GroupShared && 
				await StudyGroup.exists({
					_id: { $in: flashcard.groupIds },
					members: interaction.user.id
				}));

		if (!hasAccess) {
			await interaction.reply({
				content: strings.noPermission,
				ephemeral: true
			});
			return;
		}

		const difficultyString = flashcard.difficulty === Difficulty.Easy ? strings.easy : flashcard.difficulty === Difficulty.Medium ? strings.medium : strings.hard;

		const tagName = flashcard.tag ? (await FlashcardTag.findById(flashcard.tag))?.name : null;

		const embed = new EmbedBuilder()
		.setTitle(strings.title)
		.addFields(
			{ name: strings.question, value: flashcard.question },
			{ name: strings.answer, value: flashcard.answer },
			{ name: strings.topic, value: flashcard.topic ?? strings.none },
			{ name: strings.difficulty, value: difficultyString },
			{ name: strings.tag, value: tagName ?? strings.none },
			{ name: strings.hints, value: flashcard.hints?.length ? flashcard.hints.join('\n') : strings.none },
			{ name: strings.examples, value: flashcard.examples?.length ? flashcard.examples.join('\n') : strings.none },
			{ name: strings.author, value: `<@${flashcard.user}>` },
			{ name: strings.created, value: moment(flashcard.createdAt).format('YYYY-MM-DD HH:mm') }
		)
		.setColor('#00ff00')
		.setTimestamp();

		if (flashcard.mediaUrl) {
			if (flashcard.mediaType === 'image') {
				embed.setImage(flashcard.mediaUrl);
			} else if (flashcard.mediaType === 'audio') {
				embed.addFields({ name: strings.audio, value: flashcard.mediaUrl });
			}
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error showing flashcard:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
import { EmbedBuilder } from 'discord.js';
import { Flashcard } from '../../models/FlashcardModel';
import { LanguageService } from '../../utils/LanguageService';
import { Test } from '../../models/TestModel';

export async function deleteFlashcard(interaction: any) {
  const flashcardId = interaction.options.getString('flashcard_id', true);

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.deleteFlashcard;

  try {
    const flashcard = await Flashcard.findById(flashcardId);

    if (!flashcard) {
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

    await Flashcard.findByIdAndDelete(flashcardId);
    await Test.updateMany(
      { 'questions.flashcardId': flashcardId },
      { $pull: { questions: { flashcardId: flashcardId } } }
    );

		const embed = new EmbedBuilder()
			.setTitle(strings.deleted.title)
			.addFields(
				{ name: strings.deleted.question, value: flashcard.question },
				{ name: strings.deleted.topic, value: flashcard.topic ?? strings.deleted.noTopic }
			)
			.setColor('#ff0000')
			.setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error('Error deleting flashcard:', error);
    await interaction.reply({
      content: strings.error,
      ephemeral: true
    });
  }
}
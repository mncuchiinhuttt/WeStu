import { EmbedBuilder } from "discord.js";
import { Flashcard, Visibility } from "../../models/Flashcard";
import { StudyGroup } from "../../models/StudyGroup";
import moment from 'moment';
import { LanguageService } from "../../utils/LanguageService";

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

    const embed = new EmbedBuilder()
      .setTitle(strings.title)
      .addFields(
        { name: strings.question, value: flashcard.question },
        { name: strings.answer, value: flashcard.answer },
        { name: strings.topic, value: flashcard.topic ?? strings.none },
        { name: strings.author, value: `<@${flashcard.user}>` },
        { name: strings.created, value: moment(flashcard.createdAt).format('YYYY-MM-DD HH:mm') }
      )
      .setColor('#00ff00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } catch (error) {
    console.error('Error showing flashcard:', error);
    await interaction.reply({
      content: strings.error,
      ephemeral: true
    });
  }
}
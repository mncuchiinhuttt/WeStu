import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { FlashcardTag } from '../../models/FlashcardTagModel';
import moment from 'moment-timezone';
import { LanguageService } from '../../utils/LanguageService';

export async function listTags(interaction: any) {
  const page = interaction.options.getInteger('page') ?? 1;
  const limit = 10; 
  const skip = (page - 1) * limit;

  const languageService = LanguageService.getInstance();
  const userLang = await languageService.getUserLanguage(interaction.user.id);
  const langStrings = require(`../../data/languages/${userLang}.json`);
  const strings = langStrings.commands.flashcard.listTags;

  try {
    const totalTags = await FlashcardTag.countDocuments();
    const totalPages = Math.ceil(totalTags / limit);

    const tags = await FlashcardTag.find()
      .sort({ usageCount: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    if (tags.length === 0) {
      await interaction.reply({
        content: strings.noTags,
        ephemeral: true
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(strings.title)
      .setDescription(strings.description.replace('{page}', page.toString()).replace('{totalPages}', totalPages.toString()))
      .setColor('#00ff00')
      .setTimestamp();

    tags.forEach((tag, index) => {
      embed.addFields({
        name: `${index + 1}. ${tag.name}`,
        value: [
          `**ID**: \`${tag._id}\``,
          `**${strings.usageCount}**: ${tag.usageCount}`,
          `**${strings.createdBy}**: <@${tag.createdBy}>`,
          `**${strings.createdAt}**: ${moment(tag.createdAt).format('YYYY-MM-DD')}`
        ].join('\n'),
        inline: false
      });
    });

    if (totalPages > 1) {
      embed.setFooter({
        text: strings.footer.replace('{totalPages}', totalPages.toString())
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });

  } catch (error) {
    console.error('Error listing tags:', error);
    await interaction.reply({
      content: strings.error,
      ephemeral: true
    });
  }
}
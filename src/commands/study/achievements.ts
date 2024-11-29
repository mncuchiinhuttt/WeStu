import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Achievement } from '../../models/AchievementModel';
import { LanguageService } from '../../utils/LanguageService';

export async function displayAchievements(interaction: CommandInteraction) {
  const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.study.achievement;

  const userId = interaction.user.id;

  const achievements = await Achievement.find({ userId: userId }).sort({ date: 1 }).lean();

  if (achievements.length === 0) {
    await interaction.reply({
      content: strings.notFound,
      ephemeral: true,
    });
    return;
  }

  let description = '';
  achievements.forEach((ach, index) => {
    const date = new Date(ach.date).toLocaleDateString('en-US', { timeZone: 'Asia/Bangkok' });
    description += strings.earned
      .replace('{index}', index + 1)
      .replace('{name}', ach.name)
      .replace('{date}', date);
  });

  const embed = new EmbedBuilder()
    .setTitle(strings.title)
    .setDescription(description)
    .setColor('#FFD700')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Achievement } from '../../models/Achievement';

export async function displayAchievements(interaction: CommandInteraction) {
  const userId = interaction.user.id;

  const achievements = await Achievement.find({ userId: userId }).sort({ date: 1 }).lean();

  if (achievements.length === 0) {
    await interaction.reply({
      content: '🏆 You have not earned any achievements yet. Keep studying to earn some!',
      ephemeral: true,
    });
    return;
  }

  let description = '';
  achievements.forEach((ach, index) => {
    const date = new Date(ach.date).toLocaleDateString('en-US', { timeZone: 'Asia/Bangkok' });
    description += `${index + 1}. **${ach.name}** - Earned on ${date}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🏅 Your Achievements')
    .setDescription(description)
    .setColor('#FFD700')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
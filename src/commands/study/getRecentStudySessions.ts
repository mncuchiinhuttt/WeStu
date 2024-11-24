import { 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  ComponentType, 
  CommandInteraction, 
  EmbedBuilder 
} from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySession";

const SESSIONS_PER_PAGE = 10;

export async function getRecentStudySessions(interaction: any) {
  try {
    if (!interaction?.user?.id) {
      throw new Error('Invalid interaction object');
    }

    const period = interaction.options.getString('period') || '7';
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const sessions = await TimeStudySession.find({
      userId: interaction.user.id,
      beginTime: { $gte: daysAgo }
    }).sort({ beginTime: -1 });

    if (sessions.length === 0) {
      await interaction.reply({
        content: `You haven't had any study sessions in the last ${period} days!`,
        ephemeral: true
      });
      return;
    }

    // Calculate total study time
    const totalDuration = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);

    const totalPages = Math.ceil(sessions.length / SESSIONS_PER_PAGE);
    let currentPage = 0;

    // Create navigation buttons
    const prevButton = new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(totalPages <= 1);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(prevButton, nextButton);

    // Create initial embed
    const embed = createPageEmbed(sessions, currentPage, totalPages, period, totalDuration);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    // Create collector for button interactions
    const collector = response.createMessageComponentCollector({ 
      componentType: ComponentType.Button,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (i: any) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ 
          content: 'These buttons are not for you!', 
          ephemeral: true 
        });
        return;
      }

      if (i.customId === 'prev' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'next' && currentPage < totalPages - 1) {
        currentPage++;
      }

      // Update button states
      prevButton.setDisabled(currentPage === 0);
      nextButton.setDisabled(currentPage === totalPages - 1);

      // Update embed
      const newEmbed = createPageEmbed(sessions, currentPage, totalPages, period, totalDuration);

      await i.update({
        embeds: [newEmbed],
        components: [row]
      });
    });

    collector.on('end', async () => {
      prevButton.setDisabled(true);
      nextButton.setDisabled(true);
      await response.edit({
        components: [row]
      });
    });

  } catch (error) {
    console.error('Error in getRecentStudySessions:', error);
    if (interaction?.reply && !interaction.replied) {
      await interaction.reply({
        content: "Failed to fetch study sessions. Please try again.",
        ephemeral: true
      });
    }
  }
}

function createPageEmbed(
  sessions: any[], 
  currentPage: number, 
  totalPages: number, 
  period: string,
  totalDuration: number
): EmbedBuilder {
  const start = currentPage * SESSIONS_PER_PAGE;
  const pageItems = sessions.slice(start, start + SESSIONS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Your Study Sessions (Last ${period} Days)`)
    .setDescription(`Total study time: ${formatDuration(totalDuration)}`)
    .setFooter({ text: `Page ${currentPage + 1}/${totalPages}` });

  pageItems.forEach(session => {
    embed.addFields({
      name: formatDate(session.beginTime),
      value: `Duration: ${formatDuration(session.duration || 0)}${
        session.isPomodoro 
          ? `\nPomodoro: ${session.pomodoroConfig?.completedSessions}/${session.pomodoroConfig?.plannedSessions} sessions` 
          : ''
      }`,
      inline: false
    });
  });

  return embed;
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return date.toLocaleString('en-US', options);
  // Example output: "Mon, Mar 18, 14:30"
}
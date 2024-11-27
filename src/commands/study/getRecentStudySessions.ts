import { 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder, 
  ComponentType, 
  CommandInteraction, 
  EmbedBuilder 
} from "discord.js";
import { TimeStudySession } from "../../models/TimeStudySession";
import { LanguageService } from "../../utils/LanguageService";

const SESSIONS_PER_PAGE = 10;
let strings: any;

export async function getRecentStudySessions(interaction: any) {
  const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
  strings = langStrings.commands.study.getRecentStudySessions;

  try {
    if (!interaction?.user?.id) {
      throw new Error('Invalid interaction object');
    }

    const period = interaction.options.getString('period') ?? '7';
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const sessions = await TimeStudySession.find({
      userId: interaction.user.id,
      beginTime: { $gte: daysAgo }
    }).sort({ beginTime: -1 });

    if (sessions.length === 0) {
      await interaction.reply({
        content: strings.noSessions.replace('{period}', period),
        ephemeral: true
      });
      return;
    }

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
          content: strings.notUserButton, 
          ephemeral: true 
        });
        return;
      }

      if (i.customId === 'prev' && currentPage > 0) {
        currentPage--;
      } else if (i.customId === 'next' && currentPage < totalPages - 1) {
        currentPage++;
      }

      prevButton.setDisabled(currentPage === 0);
      nextButton.setDisabled(currentPage === totalPages - 1);

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
        content: strings.error,
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
    .setTitle(
      strings.title.replace('{period}', period)
    )
    .setDescription(
      strings.description.replace('{totalDuration}', formatDuration(totalDuration))
    )
    .setFooter({ text: `Page ${currentPage + 1}/${totalPages} 📄` });

  pageItems.forEach(session => {
    embed.addFields({
      name: formatDate(session.beginTime),
      value: `${strings.duration}: ${formatDuration(session.duration || 0)}${
        session.isPomodoro 
          ? `\nPomodoro: ${session.pomodoroConfig?.completedSessions}/${session.pomodoroConfig?.plannedSessions} ${strings.sessions}` 
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
}
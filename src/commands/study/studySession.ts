import {
  CommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  MessageComponentInteraction,
  User,
  EmbedBuilder,
} from 'discord.js';
import moment from 'moment-timezone';
import { TimeStudySession } from '../../models/TimeStudySession';
import { updateUserStreak } from './streakService';
import { checkAndAwardAchievements } from './achievementService';
import { LanguageService } from '../../utils/LanguageService';

let strings: any;

export async function manageStudySession(interaction: any) {
  const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
  strings = langStrings.commands.study.studySession;

  try {
    const userId = interaction.user.id;
    const scheduleInput = interaction.options.getString('schedule');
    let scheduledTime: Date | null = null;

    if (scheduleInput) {

      scheduledTime = new Date(scheduleInput);

      if (!scheduledTime) {
        const embed = new EmbedBuilder()
          .setTitle(strings.invalidTime.title)
          .setDescription(strings.invalidTime.description)
          .setColor('#ff0000');

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        return;
      }

      // Check if the scheduled time is in the past
      if (scheduledTime.getTime() <= Date.now()) {
        const embed = new EmbedBuilder()
          .setTitle(strings.invalidTime)
          .setDescription(strings.invalidTime.description2)
          .setColor('#ff0000');

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        return;
      }

      // Check for existing scheduled sessions
      const existingScheduledSession = await TimeStudySession.findOne({
        userId: userId,
        finishTime: { $exists: false },
        scheduledTime: { $exists: true },
        scheduledStartNotified: false,
      });

      if (existingScheduledSession) {
        const embed = new EmbedBuilder()
          .setTitle(strings.pendingSession.title)
          .setDescription(strings.pendingSession.description)
          .setColor('#ff0000');

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        return;
      }

      // Create a new scheduled session
      const newSession = await TimeStudySession.create({
        userId: userId,
        scheduledTime: scheduledTime,
        scheduledStartNotified: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(strings.sessionSchedule.title)
        .setDescription(
          strings.sessionSchedule.description.replace('{time}', moment(scheduledTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm'))
        )
        .setColor('#00ff00');

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

    } else {
      const existingSession = await TimeStudySession.findOne({
        userId: userId,
        finishTime: { $exists: false },
        duration: { $exists: false },
      });

      if (existingSession) {
        const embed = new EmbedBuilder()
          .setTitle(strings.existingSession.title)
          .setDescription(strings.existingSession.description)
          .setColor('#ff0000');

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        return;
      }

      // Create finish button
      const finishButton = new ButtonBuilder()
        .setCustomId('finish-study')
        .setLabel(strings.finishButton)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(finishButton);

      // Start new session
      const newSession = await TimeStudySession.create({
        userId: userId,
        beginTime: new Date(),
      });

      const embed = new EmbedBuilder()
        .setTitle(strings.sessionStart.title)
        .setDescription(strings.sessionStart.description)
        .setColor('#00ff00');

      const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      // Create collector for button interaction
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 24 * 60 * 60 * 1000, 
      });

      collector.on('collect', async (i: MessageComponentInteraction) => {
        if (i.customId === 'finish-study') {
          await finishStudySession(i, newSession);
          collector.stop();
        }
      });

      collector.on('end', async (collected: any) => {
        if (collected.size === 0) {
          const session = await TimeStudySession.findById(newSession._id);
          if (!session?.finishTime) {
            const embed = new EmbedBuilder()
              .setTitle(strings.sessionTimeout.title)
              .setDescription(strings.sessionTimeout.description)
              .setColor('#ff0000');

            await interaction.editReply({
              embeds: [embed],
              components: [],
            });
            
            await TimeStudySession.findByIdAndDelete(newSession._id);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error in study session:', error);
    const embed = new EmbedBuilder()
      .setTitle(strings.error.title)
      .setDescription(strings.error.description)
      .setColor('#ff0000');

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}

async function finishStudySession(interaction: MessageComponentInteraction, session: any) {
  const beginTime = session.beginTime ?? session.scheduledTime;
  const finishTime = new Date();
  const duration = Math.floor((finishTime.getTime() - session.beginTime.getTime()) / 1000);

  await TimeStudySession.findByIdAndUpdate(session._id, {
    beginTime,
    finishTime,
    duration,
  });

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const embed = new EmbedBuilder()
    .setTitle(strings.sessionFinish.title)
    .setDescription(
      strings.sessionFinish.description
      .replace('{hours}', hours.toString())
      .replace('{minutes}', minutes.toString())
      .replace('{seconds}', seconds.toString())
    )
    .setColor('#00ff00')
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });

  await updateUserStreak(session.userId, interaction.client);
  await checkAndAwardAchievements(session.userId, interaction.client);

  // Send a follow-up motivational message
  try {
    const user = await interaction.user.fetch();
    await user.send(strings.sendUser);
  } catch (error) {
    console.error('Error sending motivational message:', error);
  }
}
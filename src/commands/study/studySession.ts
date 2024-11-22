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
import { parseScheduleInput } from '../../utils/parseScheduleInput';

export async function manageStudySession(interaction: any) {
  try {
    const userId = interaction.user.id;
    const scheduleInput = interaction.options.getString('schedule');
    let scheduledTime: Date | null = null;

    if (scheduleInput) {

      scheduledTime = new Date(scheduleInput);

      if (!scheduledTime) {
        await interaction.reply({
          content:
            'Invalid schedule time provided. Please use the format `YYYY-MM-DD HH:MM` (UTC+7).',
          ephemeral: true,
        });
        return;
      }

      // Check if the scheduled time is in the past
      if (scheduledTime.getTime() <= Date.now()) {
        await interaction.reply({
          content: 'Scheduled time must be in the future.',
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
        await interaction.reply({
          content: 'You already have a scheduled study session pending.',
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

      await interaction.reply({
        content: `✅ Study session scheduled for ${moment(scheduledTime).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm')} (UTC+7). You will receive a DM when it's time to start.`,
        ephemeral: true,
      });

    } else {
      // Start an immediate study session

      // Check for existing active session
      const existingSession = await TimeStudySession.findOne({
        userId: userId,
        finishTime: { $exists: false },
        duration: { $exists: false },
      });

      if (existingSession) {
        await interaction.reply({
          content: 'You already have an active study session!',
          ephemeral: true,
        });
        return;
      }

      // Create finish button
      const finishButton = new ButtonBuilder()
        .setCustomId('finish-study')
        .setLabel('Finish Study Session')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(finishButton);

      // Start new session
      const newSession = await TimeStudySession.create({
        userId: userId,
        beginTime: new Date(),
      });

      const response = await interaction.reply({
        content: '📝 Study session started! Click the button below when you\'re done.',
        components: [row],
        ephemeral: true,
      });

      // Create collector for button interaction
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 24 * 60 * 60 * 1000, // 24 hours
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
            await interaction.editReply({
              content: '⏰ Study session timed out. Please start a new session.',
              components: [],
            });
            // Optionally, mark the session as timed out or remove it
            await TimeStudySession.findByIdAndDelete(newSession._id);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error in study session:', error);
    await interaction.reply({
      content: 'Failed to manage study session. Please try again.',
      ephemeral: true,
    });
  }
}

async function finishStudySession(interaction: MessageComponentInteraction, session: any) {
  const finishTime = new Date();
  const duration = Math.floor((finishTime.getTime() - session.beginTime.getTime()) / 1000);

  await TimeStudySession.findByIdAndUpdate(session._id, {
    finishTime,
    duration,
  });

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const embed = new EmbedBuilder()
    .setTitle('✅ Study Session Completed')
    .setDescription(`You studied for **${hours}h ${minutes}m ${seconds}s**. Great job! 🎉`)
    .setColor('#00ff00')
    .setTimestamp();

  await interaction.update({
    embeds: [embed],
    components: [],
  });

  // Send a follow-up motivational message
  try {
    const user = await interaction.user.fetch();
    await user.send('🙌 Keep up the fantastic work! Consistency is key to achieving your goals.');
  } catch (error) {
    console.error('Error sending motivational message:', error);
  }
}
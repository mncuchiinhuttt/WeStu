import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';

export async function startPomodoro(interaction: any) {
  try {
    const studyDuration = (interaction.options.getInteger('duration') || 25) * 60000;
    const breakDuration = (interaction.options.getInteger('break') || 5) * 60000;
    const sessions = interaction.options.getInteger('sessions') || 1;
    let currentSession = 1;

    // Create study session record
    const studySession = await TimeStudySession.create({
      userId: interaction.user.id,
      beginTime: new Date(),
      isPomodoro: true,
      pomodoroConfig: {
        studyDuration: studyDuration / 60000, // Store in minutes
        breakDuration: breakDuration / 60000,
        plannedSessions: sessions,
        completedSessions: 0
      }
    });

    const stopButton = new ButtonBuilder()
      .setCustomId('stop-pomodoro')
      .setLabel('Stop Pomodoro')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(stopButton);

    const embed = new EmbedBuilder()
      .setTitle(`🍅 Starting Pomodoro Session ${currentSession}/${sessions}`)
      .setDescription(`Study: ${studyDuration / 60000}min, Break: ${breakDuration / 60000}min`)
      .setColor(0xff0000);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    const collector = response.createMessageComponentCollector({ 
      componentType: ComponentType.Button,
      time: (studyDuration + breakDuration) * sessions
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'stop-pomodoro') {
        collector.stop();
        // Update session when stopped early
        await TimeStudySession.findByIdAndUpdate(studySession._id, {
          finishTime: new Date(),
          duration: (currentSession - 1) * (studyDuration + breakDuration) / 1000,
          'pomodoroConfig.completedSessions': currentSession - 1
        });

        const stopEmbed = new EmbedBuilder()
          .setTitle('⏹️ Pomodoro stopped')
          .setDescription(`Pomodoro stopped after ${currentSession - 1} sessions.`)
          .setColor(0xff0000);

        await i.update({
          embeds: [stopEmbed],
          components: []
        });
      }
    });

    async function runPomodoroSession() {
      if (currentSession > sessions) {
        // Update session when all sessions completed
        await TimeStudySession.findByIdAndUpdate(studySession._id, {
          finishTime: new Date(),
          duration: sessions * (studyDuration + breakDuration) / 1000,
          'pomodoroConfig.completedSessions': sessions
        });

        const completeEmbed = new EmbedBuilder()
          .setTitle('🎉 All Pomodoro sessions completed!')
          .setColor(0x00ff00);

        await interaction.editReply({
          embeds: [completeEmbed],
          components: []
        });
        return;
      }

      setTimeout(async () => {
        if (!collector.ended) {
          // Update completed sessions after each study period
          await TimeStudySession.findByIdAndUpdate(studySession._id, {
            'pomodoroConfig.completedSessions': currentSession
          });

          const breakEmbed = new EmbedBuilder()
            .setTitle(`⏰ Session ${currentSession}/${sessions}`)
            .setDescription('Study time is up! Take a break!')
            .setColor(0xffff00);

          await interaction.followUp({
            embeds: [breakEmbed],
            ephemeral: true
          });

          setTimeout(async () => {
            if (!collector.ended) {
              currentSession++;
              if (currentSession <= sessions) {
                const startEmbed = new EmbedBuilder()
                  .setTitle(`⏰ Break time is over!`)
                  .setDescription(`Starting session ${currentSession}/${sessions}`)
                  .setColor(0x00ff00);

                await interaction.followUp({
                  embeds: [startEmbed],
                  ephemeral: true
                });
                runPomodoroSession();
              } else {
                await TimeStudySession.findByIdAndUpdate(studySession._id, {
                  finishTime: new Date(),
                  duration: sessions * (studyDuration + breakDuration) / 1000,
                  'pomodoroConfig.completedSessions': sessions
                });

                const completeEmbed = new EmbedBuilder()
                  .setTitle('🎉 All Pomodoro sessions completed!')
                  .setColor(0x00ff00);

                await interaction.editReply({
                  embeds: [completeEmbed],
                  components: []
                });
              }
            }
          }, breakDuration);
        }
      }, studyDuration);
    }

    runPomodoroSession();

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Failed to start Pomodoro timer',
      ephemeral: true
    });
  }
}
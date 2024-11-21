import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
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

    const response = await interaction.reply({
      content: `🍅 Starting Pomodoro Session ${currentSession}/${sessions}\nStudy: ${studyDuration/60000}min, Break: ${breakDuration/60000}min`,
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

        await i.update({
          content: `⏹️ Pomodoro stopped after ${currentSession - 1} sessions.`,
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

        await interaction.editReply({
          content: '🎉 All Pomodoro sessions completed!',
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

          await interaction.followUp({
            content: `⏰ Session ${currentSession}/${sessions}: Study time is up! Take a break!`,
            ephemeral: true
          });

          setTimeout(async () => {
            if (!collector.ended) {
              currentSession++;
              if (currentSession <= sessions) {
                await interaction.followUp({
                  content: `⏰ Break time is over! Starting session ${currentSession}/${sessions}`,
                  ephemeral: true
                });
                runPomodoroSession();
              } else {
                await TimeStudySession.findByIdAndUpdate(studySession._id, {
                  finishTime: new Date(),
                  duration: sessions * (studyDuration + breakDuration) / 1000,
                  'pomodoroConfig.completedSessions': sessions
                });

                await interaction.editReply({
                  content: '🎉 All Pomodoro sessions completed!',
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
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';
import { LanguageService } from '../../utils/LanguageService';

export async function startPomodoro(interaction: any) {
  const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.study.pomodoro;
  
  try {
    const studyDuration = (interaction.options.getInteger('duration') ?? 25) * 60000;
    const breakDuration = (interaction.options.getInteger('break') ?? 5) * 60000;
    const sessions = interaction.options.getInteger('sessions') ?? 1;
    let currentSession = 1;

    const studySession = await TimeStudySession.create({
      userId: interaction.user.id,
      beginTime: new Date(),
      isPomodoro: true,
      pomodoroConfig: {
        studyDuration: studyDuration / 60000,
        breakDuration: breakDuration / 60000,
        plannedSessions: sessions,
        completedSessions: 0
      }
    });

    const stopButton = new ButtonBuilder()
      .setCustomId('stop-pomodoro')
      .setLabel(strings.stop)
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(stopButton);

    const embed = new EmbedBuilder()
      .setTitle(
        strings.title
        .replace('{currentSession}', currentSession.toString())
        .replace('{sessions}', sessions.toString())
      )
      .setDescription(
        strings.description
        .replace('{studyDuration}', (studyDuration / 60000).toString())
        .replace('{breakDuration}', (breakDuration / 60000).toString())
      )
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
          .setTitle(strings.stopTitle)
          .setDescription(
            strings.stopMessage
            .replace('{currentSession}', (currentSession - 1).toString())
          )
          .setColor(0xff0000);

        await i.update({
          embeds: [stopEmbed],
          components: []
        });
      }
    });

    async function runPomodoroSession() {
      if (currentSession > sessions) {
        await TimeStudySession.findByIdAndUpdate(studySession._id, {
          finishTime: new Date(),
          duration: sessions * (studyDuration + breakDuration) / 1000,
          'pomodoroConfig.completedSessions': sessions
        });

        const completeEmbed = new EmbedBuilder()
          .setTitle(strings.complete)
          .setColor(0x00ff00);

        await interaction.editReply({
          embeds: [completeEmbed],
          components: []
        });
        return;
      }

      setTimeout(async () => {
        if (!collector.ended) {
          await TimeStudySession.findByIdAndUpdate(studySession._id, {
            'pomodoroConfig.completedSessions': currentSession
          });

          const breakEmbed = new EmbedBuilder()
            .setTitle(
              strings.break.title
              .replace('{currentSession}', currentSession.toString())
              .replace('{sessions}', sessions.toString())
            )
            .setDescription(strings.break.description)
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
                  .setTitle(strings.break.overTitle)
                  .setDescription(
                    strings.break.overMessage
                    .replace('{currentSession}', currentSession.toString())
                    .replace('{sessions}', sessions.toString())
                  )
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
                  .setTitle(strings.allComplete)
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
      content: strings.error,
      ephemeral: true
    });
  }
}
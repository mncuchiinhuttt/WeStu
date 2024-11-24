import { Task, TaskStatus } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function completeTask(interaction: any) {
  const taskId = interaction.options.getString('task_id');
  const languageService = LanguageService.getInstance();
  const userLang = await languageService.getUserLanguage(interaction.user.id);
  const langStrings = require(`../../data/languages/${userLang}.json`);

  try {
    const task = await Task.findOne({ 
      _id: taskId,
      userId: interaction.user.id
    });

    if (!task) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000') // Red color in hex
        .setTitle(langStrings.commands.todo.completeTask.error)
        .setDescription(langStrings.commands.todo.completeTask.taskNotFound);
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      return;
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.progress = 100;

    await task.save();

    const embed = new EmbedBuilder()
      .setColor('#00FF00') // Green color in hex
      .setTitle(langStrings.commands.todo.completeTask.success)
      .setDescription(`✅ ${langStrings.commands.todo.completeTask.successReply} **${task.title}** (${langStrings.commands.todo.completeTask.progress}: 100%)`)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    const embed = new EmbedBuilder()
      .setColor('#FF0000') // Red color in hex
      .setTitle(langStrings.commands.todo.completeTask.error)
      .setDescription(langStrings.commands.todo.completeTask.errorReply);
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}
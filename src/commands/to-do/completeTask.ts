import { Task, TaskStatus } from '../../models/Task';
import { EmbedBuilder } from 'discord.js';

export async function completeTask(interaction: any) {
  try {
    const taskId = interaction.options.getString('task_id');
    const task = await Task.findOne({ 
      _id: taskId,
      userId: interaction.user.id
    });

    if (!task) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000') // Red color in hex
        .setDescription('Task not found');
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
      .setTitle('Task Completed')
      .setDescription(`✅ Completed task: **${task.title}** (Progress: 100%)`)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    const embed = new EmbedBuilder()
      .setColor('#FF0000') // Red color in hex
      .setDescription('An error occurred while completing the task');
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}
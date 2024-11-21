import { Task, TaskStatus } from '../../models/Task';

export async function completeTask(interaction: any) {
  try {
    const taskId = interaction.options.getString('task_id');
    const task = await Task.findOne({ 
      _id: taskId,
      userId: interaction.user.id
    });

    if (!task) {
      await interaction.reply({
        content: 'Task not found',
        ephemeral: true
      });
      return;
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.progress = 100;

    await task.save();

    await interaction.reply({
      content: `✅ Completed task: **${task.title}** (Progress: 100%)`,
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Failed to complete task',
      ephemeral: true
    });
  }
}
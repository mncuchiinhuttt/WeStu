import { Task } from '../../models/Task';
import { EmbedBuilder, APIEmbedField } from 'discord.js';

export async function showTemplates(interaction: any) {
  try {
    const templates = await Task.find({
      userId: interaction.user.id,
      template: true
    }).sort({ templateName: 1 });

    const embed = new EmbedBuilder()
      .setTitle('📑 Your Task Templates')
      .setColor('#00ff00')
      .setTimestamp();

    if (templates.length === 0) {
      embed.setDescription('No templates found. Use `/todo save-template` to create one.');
    } else {
      const embedFields: APIEmbedField[] = templates.map(template => {
        let details = [];
        if (template.description) details.push(`Description: ${template.description}`);
        if (template.priority) details.push(`Priority: ${template.priority}`);
        if (template.category) details.push(`Category: ${template.category}`);
        if (template.tags?.length) details.push(`Tags: ${template.tags.join(', ')}`);
        
        let subtasks = '';
        if (template.subtasks?.length) {
          subtasks = '\nSubtasks:\n' + template.subtasks
            .map((st: any) => `- ${st.title}`)
            .join('\n');
        }

        return {
          name: template.templateName || 'Unnamed Template',
          value: [
            `Title: ${template.title}`,
            ...details,
            subtasks
          ].join('\n'),
          inline: false
        };
      });

      embed.addFields(embedFields);
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Failed to show templates',
      ephemeral: true
    });
  }
}
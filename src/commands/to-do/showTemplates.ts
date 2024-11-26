import { Task } from '../../models/Task';
import { EmbedBuilder, APIEmbedField } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function showTemplates(interaction: any) {
  const languageService = LanguageService.getInstance();
  const userLang = await languageService.getUserLanguage(interaction.user.id);
  const langStrings = require(`../../data/languages/${userLang}.json`);
  const strings = langStrings.commands.todo.showTemplates;

  try {
    const templates = await Task.find({
      userId: interaction.user.id,
      template: true
    }).sort({ templateName: 1 });

    const embed = new EmbedBuilder()
      .setTitle(strings.title)
      .setColor('#00ff00')
      .setTimestamp();

    if (templates.length === 0) {
      embed.setDescription(strings.description);
    } else {
      const embedFields: APIEmbedField[] = templates.map(template => {
        let details = [];
        if (template.description) details.push(
          strings.template.description
            .replace('{description}', template.description)
        );
        if (template.priority) details.push(
          strings.template.priority
            .replace('{priority}', template.priority)
        );
        if (template.category) details.push(
          strings.template.category
            .replace('{category}', template.category)
        );
        if (template.tags?.length) details.push(
          strings.template.tags
            .replace('{tags}', template.tags.join(', '))
        );
        
        let subtasks = '';
        if (template.subtasks?.length) {
          subtasks = strings.template.subtasks + template.subtasks
            .map((st: any) => `- ${st.title}`)
            .join('\n');
        }

        return {
          name: template.templateName ?? strings.template.noName,
          value: [
            strings.template.title
              .replace('{title}', template.title),
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
      content: strings.error,
      ephemeral: true
    });
  }
}
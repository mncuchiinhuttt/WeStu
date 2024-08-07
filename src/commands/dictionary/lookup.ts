import { 
  SlashCommandBuilder 
} from 'discord.js';

import { 
  dictionaryapidev
} from './lookupFunctions/dictionaryapidev';

module.exports = {
  run: ({
    interaction,
  }: any) => {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'dictionaryapidev') {
      dictionaryapidev({ 
        interaction 
      });
    } else if (subCommand === 'wiktionary') {
      interaction.reply('This feature is not yet implemented');
    }
  },

  data: new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Look up a word in the dictionary')
    .addSubcommand(subCommand =>
      subCommand
        .setName('dictionaryapidev')
        .setDescription('Look up a word in the dictionary using Dictionary API (dictionaryapi.dev)')
        .addStringOption(option =>
          option
            .setName('word')
            .setDescription('The word to look up')
            .setRequired(true)
        )
    )
    .addSubcommand(subCommand =>
      subCommand
        .setName('wiktionary')
        .setDescription('Look up a word in the dictionary using Wiktionary (wiktionary.org)')
        .addStringOption(option =>
          option
            .setName('word')
            .setDescription('The word to look up')
            .setRequired(true)
        )
    ),

    options: {
      devOnly: false,
    }
} 
import { SlashCommandBuilder } from 'discord.js';
import { dictionaryapidev } from './lookupFunctions/dictionaryapidev';
import { wiktionary } from './lookupFunctions/wiktionary';
import wiktionaryLanguages from '../../data/wiktionarLanguages.json';

function run ({
  interaction,
}: any) {
  const subCommand = interaction.options.getSubcommand();
  if (subCommand === 'dictionaryapidev') {
    dictionaryapidev({ 
      interaction
    });
  } else if (subCommand === 'wiktionary') {
    
    wiktionary({
      interaction, 
      wiktionaryLanguages
    });
  }
};

const data = new SlashCommandBuilder()
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
      .setDescription('Look up a word in the dictionary (for all languages) using Wiktionary (wiktionary.org)')
      .addStringOption(option =>
        option
          .setName('word')
          .setDescription('The word to look up')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('language')
          .setDescription('Language of the word to look up')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
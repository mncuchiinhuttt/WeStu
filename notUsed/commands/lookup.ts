import { 
    ApplicationCommandOptionType, 
    Client, 
    ChatInputCommandInteraction as Interaction 
  } from 'discord.js';
  
  import { 
    CommandData, 
    SlashCommandProps, 
    CommandOptions 
  } from 'commandkit';
  
  async function getFromDictionary(word: string) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const headerDate = response.headers && response.headers.get('date') ? response.headers.get('date') : 'no response date';
      console.log('Status Code:', response.status);
      console.log('Date in Response header:', headerDate);
  
      const data = await response.json();
      
      console.log(`Looked up word ${word}`);
  
      return data;
    } catch (error) {
      console.log(`ERROR:\n${error}`); //can be console.error
      return false;
    }
  }
  
  function commandCallback (client: Client, interaction: Interaction) {
    const option = interaction.options.get("word");
    if (!(option)) {
      interaction.reply("Error: Internal error");
      return;
    }
    
    const word = option.value;
  
    try {
      var information = getFromDictionary(<string>word);
  
      if (!(information)) {
        interaction.reply("Error: Internal error");
        return;
      }
  
      information.then((value) => {
        interaction.reply(`Phonetic: ${value[0].phonetic}`);
        // console.log(value);
      })
  
  
    } catch (error) {
      console.log(error)
    }
  }
  
  export const data: CommandData = {
    name: 'lookup',
    description: "Lookup a word in the Dictionary API (dictionaryapi.dev).",
    options: [
      {
        name: 'word',
        description: 'The word to lookup',
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  };
  
  export function run({
    interaction, 
    client, 
    handler,
  }: SlashCommandProps) {
    handler.reloadCommands();
    commandCallback(client, interaction);
  }
  
  export const options: CommandOptions = {
    devOnly: false,
    testOnly: false,
  }
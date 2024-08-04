import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction as Interaction } from 'discord.js';

interface CommandOption {
    name: string; 
    description?: string; 
    type: ApplicationCommandOptionType;
    required?: boolean,
};

interface CommandCallback {
  (client: Client, interaction: Interaction): void
}

interface CommandData {
  name: string;
  description: string;
  options: CommandOption[];
  callback: CommandCallback;
}


async function getFromDictionary(word: string) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const headerDate = response.headers && response.headers.get('date') ? response.headers.get('date') : 'no response date';
    console.log('Status Code:', response.status);
    console.log('Date in Response header:', headerDate);

    const data = await response.json();
    
    console.log(`Looked up word ${word}`);

    return data;
  } catch (error: any) {
    console.log(`ERROR:\n${error.message}`); //can be console.error
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


    // interaction.reply(`Phonetic: ${information}`)

  } catch (error) {
    console.log(error)
  }
}


module.exports = {
  name: 'lookup',
  description: "Lookup a word in the Dictionary API (dictionaryapi.dev)",
  options: [
    {
      name: "word",
      description: "Word to lookup",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  callback: commandCallback
  }


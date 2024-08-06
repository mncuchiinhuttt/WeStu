import { 
	Interaction, 
	Message
} from 'discord.js';

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
		console.log(`ERROR: ${error}`);
		return false;
	}
}

export function dictionaryapidev({ 
	interaction 
}: any) {
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
			if(value.title === "No Definitions Found") {
				interaction.reply("No definitions found.");
				return;
			}
			
			let replyMessage: String = `# ${value[0].word}\n## Phonetics\n`;
			let splitMode: Boolean = false;

			const regex = /https:\/\/api\.dictionaryapi\.dev\/media\/pronunciations\/en\/(.+)/;
			for (const phonetic of value[0].phonetics) {
				replyMessage += `- ${phonetic.text}`;
				if (phonetic.audio !== "") {
					const audioFileName = phonetic.audio.match(regex)[1];
					const audioURL = phonetic.audio;
					replyMessage += ` - [${audioFileName}](${audioURL})\n`;
				} else {
					replyMessage += "\n";
				}
			}

			replyMessage += "## Definitions\n";

			for (const eachValue of value) {
				for (const meaning of eachValue.meanings)
				{
					replyMessage += `**${meaning.partOfSpeech}**\n`;
					for (const definition of meaning.definitions) {
						replyMessage += `- ${definition.definition}\n`;

						if (definition.example !== undefined) {
							replyMessage += `  - *Example:* ${definition.example}\n`;
						}

						if (definition.synonyms !== undefined && definition.synonyms.length > 0) {
							replyMessage += `  - *Synonyms:* ${definition.synonyms.join(", ")}\n`;
						}

						if (definition.antonyms !== undefined && definition.antonyms.length > 0) {
							replyMessage += `  - *Antonyms:* ${definition.antonyms.join(", ")}\n`;
						}
					}

					if (replyMessage.length > 1900) {
						if (splitMode === true) {
							interaction.followUp(replyMessage);
							replyMessage = "";
						} else {
							interaction.reply(replyMessage);
							replyMessage = "";
							splitMode = true;
						}
					}

					if (meaning.synonyms !== undefined && meaning.synonyms.length > 0) {
						replyMessage += `- **Synonyms:** ${meaning.synonyms.join(", ")}\n`;
					}
					
					if (meaning.antonyms !== undefined && meaning.antonyms.length > 0) {
						replyMessage += `- **Antonyms:** ${meaning.antonyms.join(", ")}\n`;
					}
				}
			}

			if (splitMode === true) {
				interaction.followUp(replyMessage);
			} else {
				interaction.reply(replyMessage);
			}
		});
	} catch (error) {
		console.log(`ERROR:\n${error}`);
	}
}
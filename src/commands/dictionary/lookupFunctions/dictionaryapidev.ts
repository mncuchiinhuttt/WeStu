import messageArray from "../../../data/message_array";

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function getFromDictionary(word: string) {
	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
		const headerDate = response.headers && response.headers.get('date') ? response.headers.get('date') : 'no response date';
		console.log('Status Code:', response.status);
		console.log('Date in Response header:', headerDate);

		if (response.status === 404) {
			console.log(`Word ${word} not found`);
			return false;
		}

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
		interaction.reply({ content: "Error: Internal error", ephemeral: true });
		return;
	}

	const word = option.value;

	try {
		const information = getFromDictionary(<string>word);

		if (!(information)) {
			interaction.reply({ content: "Error: Internal error", ephemeral: true });
			return;
		}

		information.then((value) => {
			if (value === false || value.title === "No Definitions Found") {
				interaction.reply({ content: "No definitions found.", ephemeral: true });
				return;
			}

			let replyMessage = new messageArray();
			let sourceURLs = new Set<string>();

			const regex = /https:\/\/api\.dictionaryapi\.dev\/media\/pronunciations\/en\/(.+)/;
			const multipleEtymology = (value.length >= 2);
			let currentEtymology = 0;

			for (const eachValue of value) {
				++currentEtymology;

				if (multipleEtymology) {
					replyMessage.push(`# ${eachValue.word} (Etymology ${currentEtymology})\n`);
				} else {
					replyMessage.push(`# ${eachValue.word}\n`);
				}

				if (currentEtymology === 1) {
					replyMessage.push("## Phonetics\n");

					for (const phonetic of eachValue.phonetics) {
						replyMessage.push(`- ${phonetic.text}`);
						if (phonetic.audio !== "") {
							const audioFileName = phonetic.audio.match(regex)[1];
							const audioURL = phonetic.audio;
							replyMessage.push(` - [${audioFileName}](${audioURL})\n`);
						} else {
							replyMessage.push("\n");
						}
					}
				}

				replyMessage.push("## Definitions\n");

				for (const meaning of eachValue.meanings) {
					replyMessage.push(`**${meaning.partOfSpeech}**\n`);

					for (const definition of meaning.definitions) {
						replyMessage.push(`- ${definition.definition}\n`);

						if (definition.example !== undefined) {
							replyMessage.push(`  - *Example:* ${definition.example}\n`);
						}

						if (definition.synonyms !== undefined && definition.synonyms.length > 0) {
							replyMessage.push(`  - *Synonyms:* ${definition.synonyms.join(", ")}\n`);
						}

						if (definition.antonyms !== undefined && definition.antonyms.length > 0) {
							replyMessage.push(`  - *Antonyms:* ${definition.antonyms.join(", ")}\n`);
						}
					}

					if (meaning.synonyms !== undefined && meaning.synonyms.length > 0) {
						replyMessage.push(`- **Synonyms:** ${meaning.synonyms.join(", ")}\n`);
					}

					if (meaning.antonyms !== undefined && meaning.antonyms.length > 0) {
						replyMessage.push(`- **Antonyms:** ${meaning.antonyms.join(", ")}\n`);
					}
					for (const sourceURL of eachValue.sourceUrls) {
						sourceURLs.add(sourceURL);
					}
				}
			}

			replyMessage.push("## Source URLs\n");
			for (const sourceURL of sourceURLs) {
				replyMessage.push(`- ${sourceURL}\n`);
			}

			const totalPageNumber = replyMessage.length();
			
			(async () => {
				if (totalPageNumber === 1) {
					await interaction.reply({ content: replyMessage.get(0), ephemeral: true });
				} else {
					await interaction.reply({ content: replyMessage.get(0) + `-# Page 1/${totalPageNumber}`, ephemeral: true });
					for (let i = 1, _n = replyMessage.length(); i < _n; i++) {
						await interaction.followUp({ content: replyMessage.get(i) + `-# Page ${i + 1}/${totalPageNumber}`, ephemeral: true });
					}
				}
			})();
		});
	} catch (error) {
		console.log(`ERROR: ${error}`);
	}
}
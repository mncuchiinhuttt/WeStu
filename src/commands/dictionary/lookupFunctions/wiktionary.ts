import messageArray from '../../../data/message_array';

function removeHTMLTags(str: string): string[] {
    return str.replace(/<[^>]*>/g, '').split('\n');
}

async function fetchFromWiktionary(word: string) {
	try {
		const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word}`);
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

export function wiktionary({
  interaction,
  wiktionaryLanguages
}: any) {
	const lookUpWord = interaction.options.get("word");
	const language: string = interaction.options.getString("language");
	
	if (!(lookUpWord)) {
		interaction.reply("Error: Internal error");
		return;
	}
	
	try {
		const word = lookUpWord.value;
		const information = fetchFromWiktionary(<string>lookUpWord.value.trim().replace(/\s+/g, "_"));

		if (!(information)) {
			interaction.reply("Error: Internal error");
			return;
		}

		information.then(async (value) => {
			if (value === false || value.title === "Not found.") {
				interaction.reply("No definitions found.");
				return;
			}

			if (language in value) {
				let message = new messageArray();
				
				message.push(`# ${word}\n`);
				
				for (const part of value[language]) {
					let definitionArray = new Set();
					let exampleArray = new Set();

					message.push(`## ${part.partOfSpeech}\n`);

					for (const definition of part.definitions) {
						const cleanDefinitions = removeHTMLTags(definition.definition);
						if (cleanDefinitions.length > 0) {
							for (const cleanDefinition of cleanDefinitions) {
								if (cleanDefinition.length > 0) {
									definitionArray.add(`${cleanDefinition}`);
								}
							}
						}

						if (definition.examples) {
							for (const example of definition.examples) {
								const cleanExamples = removeHTMLTags(example);
								if (cleanExamples.length > 0) {
									for (const cleanExample of cleanExamples) {
										if (cleanExample.length > 0) {
											exampleArray.add(`${cleanExample}`);
										}
									}
								}
							}
						}
					}

					message.push(`**Definition**\n`);
					for (const definition of definitionArray) {
						message.push(`- ${definition}\n`);
					}
					
					if(exampleArray.size > 0) {
						message.push(`**Example**\n`);
						for (const example of exampleArray) {
							message.push(`- ${example}\n`);
						}
					}
				}

				(async () => {
					const totalPageNumber = message.length();

					if (totalPageNumber === 1) {
						await interaction.reply(message.get(0));
					} else {
						await interaction.reply(message.get(0) + `-# Page 1/${totalPageNumber}`);
						for (let i = 1, _n = message.length(); i < _n; i++) {
							await interaction.followUp(message.get(i) + `-# Page ${i + 1}/${totalPageNumber}`);
						}
					}
				})();

				return;
			} else {
				const languageName = wiktionaryLanguages.find((lang: any) => lang.id === language).name;
				await interaction.reply(`Word \`${word}\` does not exist in ${languageName}`);
				return;
			}
		});
		
	} catch (error) {
		console.log(`ERROR: ${error}`);
	}
}
import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { Interaction } from 'discord.js';

const autoCompleteCommandName = ['lookup'];

async function wiktionaryAutoComplete(interaction: any, focusedValue: any) {
	if (focusedValue.name === 'language') {
		const filteredLanguages = wiktionaryLanguages.filter((language: any) => 
			language.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredLanguages.map((language: any) => {
			return {
				name: `${language.name} - ${language.id}`,
				value: language.id,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

export default async function (interaction: Interaction) {	
	if (!interaction.isAutocomplete()) return;
	if (!autoCompleteCommandName.includes(interaction.commandName)) return;

	const focusedValue = interaction.options.getFocused(true);
	await wiktionaryAutoComplete(interaction, focusedValue);
};
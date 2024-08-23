import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import element from '../../data/chemical-elements/element-data.json';
import { Interaction } from 'discord.js';

const autoCompleteCommandName = ['lookup', 'element'];

async function wiktionaryAutoComplete (interaction: any, focusedValue: any) {
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

async function elementAutoComplete (interaction: any, focusedValue: any) {

}

export default async function (interaction: Interaction) {	
	if (!interaction.isAutocomplete()) return;
	if (!autoCompleteCommandName.includes(interaction.commandName)) return;

	const focusedValue = interaction.options.getFocused(true);
	if (interaction.commandName == 'lookup') {
		await wiktionaryAutoComplete(interaction, focusedValue);
	} else if (interaction.commandName == 'element') {
		await elementAutoComplete(interaction, focusedValue);
	}
};
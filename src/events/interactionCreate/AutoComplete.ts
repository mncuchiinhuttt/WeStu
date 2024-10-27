import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { Interaction } from 'discord.js';
import { elementNameOptions, elementSymbolOptions } from '../../data/chemical-elements/elementNameCommandOptions';
import Trivia_API_Categories from '../../data/trivia-api-categories.json';

const autoCompleteCommandName = ['lookup', 'element', 'study'];

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
	if (focusedValue.name === 'name') {
		const filteredElements = elementNameOptions.filter((element: any) => 
			element.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredElements.map((element: any) => {
			return {
				name: `${element.name} - ${element.value}`,
				value: element.value,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	} else if (focusedValue.name === 'symbol') {
		const filteredElements = elementSymbolOptions.filter((element: any) => 
			element.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredElements.map((element: any) => {
			return {
				name: `${element.name} - ${element.value}`,
				value: element.value,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

async function studyAutoComplete (interaction: any, focusedValue: any) {
	if (focusedValue.name === 'category') {
		const filteredCategories = Trivia_API_Categories.filter((category: any) => 
			category.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredCategories.map((category: any) => {
			return {
				name: `${category.name}`,
				value: category.id,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

export default async function (interaction: Interaction) {	
	if (!interaction.isAutocomplete()) return;
	if (!autoCompleteCommandName.includes(interaction.commandName)) return;

	const focusedValue = interaction.options.getFocused(true);
	if (interaction.commandName == 'lookup') {
		await wiktionaryAutoComplete(interaction, focusedValue);
	} else if (interaction.commandName == 'element') {
		await elementAutoComplete(interaction, focusedValue);
	} else if (interaction.commandName == 'study') {
		await studyAutoComplete(interaction, focusedValue);
	}
};
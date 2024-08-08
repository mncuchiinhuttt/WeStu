import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { CommandKit } from 'commandkit';
import { Interaction } from 'discord.js';

async function wiktionaryAutoComplete(interaction: any) {
	if (interaction.commandName !== 'lookup') return;

	const focusedValue = interaction.options.getFocused();
	const filteredLanguages = wiktionaryLanguages.filter((language: any) => 
		language.name.toLowerCase().startsWith(focusedValue.toLowerCase())
	);

	const results = filteredLanguages.map((language: any) => {
		return {
			name: `${language.name} - ${language.id}`,
			value: language.id,
		};
	});

	await interaction.respond(results.slice(0, 25)).catch(() => {});
}

export default function (interaction: Interaction) {	
	if (!interaction.isCommand()) return;
	wiktionaryAutoComplete(interaction);
};
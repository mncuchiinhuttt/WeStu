import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function run ({
  interaction,
}: any) {
	const text = interaction.options.getString('text')!;
	const orginal_language = interaction.options.getString('orginal_language')!;
	const target_language = interaction.options.getString('target_language')!;

	await interaction.deferReply({ ephemeral: true });
	await interaction.editReply('Translating...');

	const url = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';
	const options = {
		method: 'POST',
		headers: {
			'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
			'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify ({
			q: `${text}`,
			source: `${orginal_language}`,
			target: `${target_language}`
		})
	};

	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const translated = result.data.translations.translatedText;
		const bot_response = new messageArray();
		bot_response.push('**Original Text:** ' + text + '\n');
		bot_response.push('**Translated Text:** ' + translated + '\n');
		const message_length = bot_response.length();
		if (message_length === 1) {
			await interaction.editReply(bot_response.get(0));
		} else {
			const pages = bot_response.withPageNumber();
			await interaction.editReply(pages[0]);
			for (let i = 1; i < pages.length; i++) {
				await interaction.followUp(pages[i]);
			}
		}
	} catch (error) {
		console.error(error);
		await interaction.editReply('An error occurred while trying to translate the text.');
	}
};

const data = new SlashCommandBuilder()
	.setName('translate')
	.setDescription('Translate text to another language')
	.addStringOption(option => 
		option
		.setName('text')
		.setDescription('The text to translate')
		.setRequired(true)
	)
	.addStringOption(option =>
		option
		.setName('orginal_language')
		.setDescription('The original language')
		.setRequired(true)
		.setAutocomplete(true)
	)
	.addStringOption(option =>
		option
		.setName('target_language')
		.setDescription('The target language')
		.setRequired(true)
		.setAutocomplete(true)
	)

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';
import 'dotenv/config';

async function run ({
	interaction,
}: any) {
	const word = interaction.options.getString('word');
	await interaction.deferReply();
	await interaction.editReply('Waiting...');

	if (!word || word.includes(' ')) {
		await interaction.editReply('Please provide a single word without spaces.');
		return;
	}

	const url = `https://www.stands4.com/services/v2/syno.php?uid=${process.env.STANDS4_UID}&tokenid=${process.env.STANDS4_TOKEN}&word=${word}&format=json`;
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const bot_response = new messageArray();
		
		bot_response.push(`# ${word}\n`);
		let count = 1;
		for (const singleResult of result.result) {
			bot_response.push(`### Definition ${count++}\n`);
			bot_response.push(`- **Term:** ${singleResult.term}\n`);
			bot_response.push(`- **Definition:** ${singleResult.definition}\n`);
			if (typeof singleResult.example === 'string' && singleResult.example.length > 0) {
				bot_response.push(`- **Example:** ${singleResult.example}\n`);
			} else if (Array.isArray(singleResult.example) && singleResult.example.length > 0) {
				bot_response.push(`- **Examples:**\n`);
				for (const example of singleResult.example) {
					bot_response.push(`  - ${example}\n`);
				}
			}
			bot_response.push(`- **Synonyms:** ${singleResult.synonyms}\n`);
			if (singleResult.antonyms.length > 0) {
				bot_response.push(`- **Antonyms:** ${singleResult.antonyms}\n`);
			}
		}

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
		await interaction.editReply('There was an error trying to execute that command!');
	}
};

const data = new SlashCommandBuilder()
	.setName('synonyms')
	.setDescription('Find synonyms/antonyms for a word')
	.addStringOption(option =>
		option
		.setName('word')
		.setDescription('The word to find synonyms/antonyms for')
		.setRequired(true)
	)

const options = {
	devOnly: false,
}

module.exports = {
	data,
	run,
	options
}
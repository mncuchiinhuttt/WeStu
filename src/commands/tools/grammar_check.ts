import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';
import 'dotenv/config';

async function run ({
	interaction,
}: any) {
	const text = interaction.options.getString('text');
	await interaction.deferReply();
	await interaction.editReply('Checking...');

	const url = `https://www.stands4.com/services/v2/grammar.php?uid=${process.env.STANDS4_UID}&tokenid=${process.env.STANDS4_TOKEN}&text=${encodeURIComponent(text)}&format=json`;
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

		const inCompleteResult = result.warnings.incompleteResults;

		if (inCompleteResult) {
			bot_response.push('**Warning:** The results are incomplete. Some errors may not be shown.\n');
		}

		bot_response.push('**Original Text:** ' + text + '\n');

		const errors = result.matches;
		for (const error of errors) {
			bot_response.push(`**Error:** ${error.message}\n`);
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
	.setName('grammar_check')
	.setDescription('Check the grammar of a sentence')
	.addStringOption(option =>
		option
		.setName('text')
		.setDescription('The text to check')
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
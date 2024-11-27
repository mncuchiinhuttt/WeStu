import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function run ({
  interaction,
}: any) {
	const text = interaction.options.getString('text')!;
	const mode = interaction.options.getString('mode')!;

	await interaction.deferReply({ ephemeral: true });
	await interaction.editReply('Summarizing...');

	const url = (mode === 'high') ? 'https://cheapest-gpt-ai-summarization.p.rapidapi.com/api/summarize' : 'https://cheapest-gpt-ai-summarization.p.rapidapi.com/api/summarize-simple';
	const options = {
		method: 'POST',
		headers: {
			'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
			'x-rapidapi-host': 'cheapest-gpt-ai-summarization.p.rapidapi.com',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify ({
			text: `${text}`,
			length: '15',
			style: 'text'
		})
	};

	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const summary = result.result;
		const bot_response = new messageArray();
		bot_response.push('**Original Text:** ' + text + '\n');
		bot_response.push('**Summary:** ' + summary);
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
		await interaction.editReply('An error occurred while trying to summarize the text.');
	}
};

const data = new SlashCommandBuilder()
	.setName('summarization')
	.setDescription('Summarize text.')
	.addStringOption(option =>
		option
		.setName('mode')
		.setDescription('The mode to use for summarization')
		.setRequired(true)
		.addChoices( 
			{ name: 'Low (up to 1,400 characters)', value: 'low' },
			{ name: 'High (up to 14,000 characters)', value: 'high' }
		)
	)
	.addStringOption(option =>
		option
		.setName('text')
		.setDescription('The text to summarize')
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
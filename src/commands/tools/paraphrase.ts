import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function run ({
	interaction,
}: any) {
	const text = interaction.options.getString('text')!;

	await interaction.deferReply();
	await interaction.editReply('Paraphrasing...');

	const url = 'https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/rewrite';
	const options = {
		method: 'POST',
		headers: {
			'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
			'x-rapidapi-host': 'rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			language: 'en',
			strength: 3,
			text: `${text}`,
		}),
	};

	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const paraphrased_text = result.rewrite;
		const bot_response = new messageArray();
		bot_response.push('**Original Text:** ' + text + '\n');
		bot_response.push('**Paraphrased Text:** ' + paraphrased_text + '\n');
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
		await interaction.editReply('An error occurred while trying to paraphrase the text.');
	}
};

const data = new SlashCommandBuilder()
	.setName('paraphrase')
	.setDescription('Paraphrase a text')
	.addStringOption(option => 
		option
		.setName('text')
		.setDescription('The text to pararphrase')
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
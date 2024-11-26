import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function run ({
	interaction,
}: any) {
	const question = interaction.options.getString('question');
	await interaction.deferReply();
	await interaction.editReply('Thinking...');

	const url = 'https://copilot5.p.rapidapi.com/copilot';
	const options = {
		method: 'POST',
		headers: {
			'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
			'x-rapidapi-host': 'copilot5.p.rapidapi.com',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message: question,
			conversation_id: null,
			tone: 'BALANCED',
			markdown: false,
			photo_url: null
		})
	};

	try {
		const response = await fetch(url, options);
		const result = await response.json();
		const bot_response = new messageArray();

		bot_response.push(result.data.message);
		bot_response.push(`\n\n**Source:**\n`);
		for (const source of result.data.sources) {
			bot_response.push(`- [${source.title}](${source.url})\n`);
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

		if (result.data.images.length > 0) {
			for (const image of result.data.images) {
				await interaction.followUp({
					files: [image.url]
				});
			}
		}
	} catch (error) {
		console.error(error);
	}
};

const data = new SlashCommandBuilder()
	.setName('copilot')
	.setDescription('Ask Copilot a question')
	.addStringOption(option =>
		option
		.setName('question')
		.setDescription('The question to ask Copilot')
		.setRequired(true)
	);

const options = {
	devOnly: true,
}

module.exports = {
	data,
	run,
	options
}
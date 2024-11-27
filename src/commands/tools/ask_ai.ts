import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function run ({
	interaction,
}: any) {
	const question = interaction.options.getString('question');
	const model = interaction.options.getString('model');
	await interaction.deferReply({ ephemeral: true });
	await interaction.editReply('Thinking...');
	if (model === 'gpt') {
		const url = 'https://chatgpt-42.p.rapidapi.com/gpt4';
		const options = {
			method: 'POST',
			headers: {
				'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
				'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				messages: [
					{
						role: 'user',
						content: question
					}
				],
				web_access: false
			})
		};

		try {
			const response = await fetch(url, options);
			const result = await response.json();
			const bot_response = new messageArray();
			bot_response.push(result.result);
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
		}
	} else {
		const url = 'https://chatgpt-42.p.rapidapi.com/geminipro';
		const options = {
			method: 'POST',
			headers: {
				'x-rapidapi-key': 'f393cc3157msh021ad9a5af4d664p194df4jsn481019e588c5',
				'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				messages: [
					{
						role: 'user',
						content: question
					}
				],
				temperature: 0.9,
				top_k: 5,
				top_p: 0.9,
				max_tokens: 256,
				web_access: false
			})
		};
		
		try {
			const response = await fetch(url, options);
			const result = await response.json();
			const bot_response = new messageArray();
			bot_response.push(result.result);
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
		}
	}
};

const data = new SlashCommandBuilder()
	.setName('ask_ai')
	.setDescription('Ask AI for help with a question')
	.addStringOption(option =>
		option
		.setName('model')
		.setDescription('Choose model to use')
		.setRequired(true)
		.addChoices(
			{ name: 'OpenAI GPT-4o', value: 'gpt' },
			{ name: 'Google Gemini Advance', value: 'gemini' },
		)
	)
	.addStringOption(option =>
		option
		.setName('question')
		.setDescription('The question to ask GPT-4o')
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
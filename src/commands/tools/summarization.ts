import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';

async function query (data: any) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
		{
			headers: {
				Authorization: "Bearer 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",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

async function run ({
  interaction,
}: any) {
	const text = interaction.options.getString('text')!;
	await interaction.deferReply();
	await interaction.editReply('Summarizing...');
	try {
		query({"inputs": `${text}`}).then(async (response) => {
			const bot_response = new messageArray();
			bot_response.push(response[0].summary_text);
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
		});
	} catch (error) {
		console.error(error);
		await interaction.editReply('An error occurred while trying to summarize the text.');
	}
};

const data = new SlashCommandBuilder()
	.setName('summarization')
	.setDescription('Summarize text using Facebook BART. This command is only supported in English.')
	.addStringOption(option =>
		option
		.setName('text')
		.setDescription('The text to summarize')
		.setRequired(true)
	)

const options = {
  devOnly: true,
}

module.exports = {
  data,
  run,
  options
}
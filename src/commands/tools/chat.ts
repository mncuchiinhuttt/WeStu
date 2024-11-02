import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';
import { HfInference } from "@huggingface/inference"

const client = new HfInference(`${process.env.HUGGINGFACE_TOKEN}`);

async function run({ interaction }: any) {
	await interaction.deferReply();
	await interaction.editReply('Chat session started. Chat session will end after 60 seconds of inactivity.');
	try {
		const filter = (m: any) => m.author.id === interaction.user.id;
		const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
		let lastMessageTime = Date.now();

		collector.on('collect', async (message: any) => {
			setTimeout(() => {
				if (Date.now() - lastMessageTime >= 60000) {
					collector.stop();
					interaction.followUp('Chat session timed out due to 60 seconds of inactivity.');
				}
			}, 60000);

			const stream = client.chatCompletionStream({
				model: "HuggingFaceTB/SmolLM2-1.7B-Instruct",
				messages: [
					{ role: "user", content: message.content }
				],
				max_tokens: 512
			});

			const responseText: string[] = [];

			for await (const chunk of stream) {
				lastMessageTime = 999999999999999;
				if (chunk.choices && chunk.choices.length > 0) {
					const newContent = chunk.choices[0].delta.content;
					if (newContent) {
						responseText.push(newContent as string);
					}
				}
			}
			
			const response = responseText.join('');
			if (response) {
				lastMessageTime = Date.now();
				await message.reply(response);
			}
		});

		collector.on('end', () => {
			interaction.followUp('Chat session ended.');
		});

	} catch (error) {
		console.error(`Error sending request to HuggingFace API: ${error}`);
		interaction.followUp('An error occurred while sending the request to the HuggingFace API.');
	}
}

const data = new SlashCommandBuilder()
	.setName('chat')
	.setDescription('Have a conversation with SmolLM2')

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
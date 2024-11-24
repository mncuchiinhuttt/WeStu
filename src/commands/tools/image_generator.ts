import { SlashCommandBuilder } from 'discord.js';
import messageArray from '../../data/message_array';
import { HfInference } from "@huggingface/inference"

const client = new HfInference(`${process.env.HUGGINGFACE_TOKEN}`);

async function query (data: any) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
		{
			headers: {
				Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

async function run({ interaction }: any) {
    const text = interaction.options.getString('text')!;
	await interaction.deferReply();
	await interaction.editReply('Generating...');
	try {
        const response = await query({"inputs": `${text}`});
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await interaction.editReply({ 
            content: `Image generated from the text: ${text}`, 
            files: [buffer] 
        });
	} catch (error) {
		console.error(error);
		await interaction.editReply('An error occurred while trying to summarize the text.');
	}
}

const data = new SlashCommandBuilder()
	.setName('image_generator')
	.setDescription('Generate an image based on the text provided.')
    .addStringOption(option => 
        option
        .setName('text')
        .setDescription('The text to generate the image from.')
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
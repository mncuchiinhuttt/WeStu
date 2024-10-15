import { SlashCommandBuilder } from 'discord.js';
import OpenAI from 'openai';

const openai = new OpenAI();

async function run ({
  interaction,
}: any) {
	interaction.reply(`This function is currently disabled due to the high cost of using the OpenAI API. If you would like to enable this function, please contact the bot owner.`);
	return;
	
	const question = interaction.options.getString('question');
	const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { 
					role: "system", 
					content: "Keep respond short and helpful." 
				},
        {
					role: "user",
					content: `${question}`,
        },
    ],
	});
	interaction.reply(`${completion.choices[0].message.content}`);
};

const data = new SlashCommandBuilder()
  .setName('askgpt')
  .setDescription('Ask GPT-4o for help with a question')
	.addStringOption(option =>
		option
		.setName('question')
		.setDescription('The question to ask GPT-4o')
		.setRequired(true)
	);

const options = {
  devOnly: false,
}

module.exports = {
  data,
  run,
  options
}
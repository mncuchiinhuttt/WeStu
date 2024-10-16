import { SlashCommandBuilder } from 'discord.js';
import { mathjs_help } from './mathjs_help';
import { mathjs_evaluate } from './mathjs_evaluate';

async function run ({
  interaction,
}: any) {
	const subCommand = interaction.options.getSubcommand();
	if (subCommand === 'help') {
		mathjs_help({ interaction });
	}
	if (subCommand === 'evaluate') {
		mathjs_evaluate({ interaction });
	}
};

const data = new SlashCommandBuilder()
  .setName('mathjs')
  .setDescription('Evaluate a math expression using math.js')
	.addSubcommand(subCommand =>
		subCommand
		.setName('help')
		.setDescription('Get help with using math.js')
	)
	.addSubcommand(subCommand => 
		subCommand
		.setName('evaluate')
		.setDescription('Evaluate a math expression using math.js')
		.addStringOption(option =>
			option
			.setName('expression')
			.setDescription('The math expression to evaluate')
			.setRequired(true)
		)
		.addNumberOption(option => 
			option
			.setName('precision')
			.setDescription('The number of decimal places to round to')
			.setRequired(false)
		)
	);

const options = {
  devOnly: true,
}

module.exports = {
  data,
  run,
  options
}
import { SlashCommandBuilder } from 'discord.js';
import { InsiderStatus } from '../../models/InsiderStatus';

export const data = new SlashCommandBuilder()
	.setName('setinsiderstatus')
	.setDescription('Turn Insider Program on or off')
	.addStringOption(option =>
		option.setName('status')
			.setDescription('Set status to on or off')
			.setRequired(true)
			.addChoices(
				{ name: 'On', value: 'on' },
				{ name: 'Off', value: 'off' }
			)
	);

export async function run({ interaction }: any) {
	const status = interaction.options.getString('status');

	await InsiderStatus.findOneAndUpdate({}, { status }, { upsert: true });

	await interaction.reply({
		content: `✅ Insider Program has been turned **${status.toUpperCase()}**.`,
		ephemeral: true
	});
}

export const options = {
	devOnly: true,
};
import { SlashCommandBuilder } from 'discord.js';
import { InsiderUser } from '../../models/InsiderUser';

export const data = new SlashCommandBuilder()
	.setName('removeinsider')
	.setDescription('Remove a user from the Insider Program')
	.addUserOption(option =>
		option.setName('user')
			.setDescription('User to remove from the Insider Program')
			.setRequired(true)
	);

export async function run({ interaction }: any) {
	const user = interaction.options.getUser('user');

	const result = await InsiderUser.findOneAndDelete({ userId: user.id });

	if (!result) {
		await interaction.reply({
			content: `${user.tag} is not registered in the Insider Program.`,
			ephemeral: true
		});
		return;
	}

	await interaction.reply({
		content: `✅ ${user.tag} has been removed from the Insider Program.`,
		ephemeral: true
	});
}

export const options = {
	devOnly: true,
};
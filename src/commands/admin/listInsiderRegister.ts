import { SlashCommandBuilder } from 'discord.js';
import { InsiderUser } from '../../models/InsiderUser';

export const data = new SlashCommandBuilder()
	.setName('listinsiders')
	.setDescription('List all users registered in the Insider Program');

export async function run({ interaction }: any) {
	const insiders = await InsiderUser.find();

	if (insiders.length === 0) {
		await interaction.reply({
			content: 'No users are currently registered in the Insider Program.',
			ephemeral: true
		});
		return;
	}

	const userList = insiders.map(user => `<@${user.userId}>`).join('\n');

	await interaction.reply({
		content: `**Insider Program Registrants:**\n${userList}`,
		ephemeral: true
	});
}

export const options = {
	devOnly: true,
};
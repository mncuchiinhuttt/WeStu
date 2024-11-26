import { SlashCommandBuilder } from 'discord.js';
import { InsiderUser } from '../../models/InsiderUser';
import { LanguageService } from '../../utils/LanguageService';

export const data = new SlashCommandBuilder()
	.setName('insiderregister')
	.setDescription('Register for the Insider Program')
	.setDescriptionLocalizations({
		'vi': 'Đăng ký chương trình Insider'
	});

export async function run({ interaction }: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.tools.insiderRegister;

	const userId = interaction.user.id;

	const existing = await InsiderUser.findOne({ userId });
	if (existing) {
		await interaction.reply({
			content: strings.alreadyRegistered,
			ephemeral: true
		});
		return;
	}

	await InsiderUser.create({ userId });

	await interaction.reply({
		content: strings.success,
		ephemeral: true
	});
}

export const options = {
	devOnly: false,
};
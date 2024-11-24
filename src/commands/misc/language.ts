import { SlashCommandBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';
import path from 'path';
import { promises as fs } from 'fs';

async function run({
	interaction,
}: any) {
	const selectedLang = interaction.options.getString('language');
	
	try {
		const languageService = LanguageService.getInstance();
		await languageService.setUserLanguage(interaction.user.id, selectedLang);
		const langFilePath = path.join(__dirname, '..', '..', 'data', 'languages', `${selectedLang}.json`);
		try {
			await fs.access(langFilePath);
		} catch (error) {
			await interaction.reply({ content: 'Language file not found', ephemeral: true });
			console.error(error);
			return;
		}

		const langStrings = require(langFilePath);
		const embed = {
			color: 0x0099ff,
			title: langStrings.responses.languageChanged,
			description: langStrings.responses.languageChangedMessage,
			timestamp: new Date(),
		};
		
		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Failed to change language', ephemeral: true });
		return;
	}
}

const data = new SlashCommandBuilder()
	.setName('language')
	.setDescription('Change bot language')
	.addStringOption(option =>
		option
		.setName('language')
		.setDescription('Select language')
		.setRequired(true)
		.addChoices(
			{ name: '🇺🇸 English', value: 'en' },
			{ name: '🇻🇳 Vietnamese', value: 'vi' },
		)
	);

const options = {
	devOnly: false
}

module.exports = {
	data,
	run,
	options
}
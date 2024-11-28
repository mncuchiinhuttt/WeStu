import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";

export async function deleteTest (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.deleteTest;

	try {
		const test_id = interaction.options.getString('test_id', true);

		const test = await TestService.deleteTest(
			test_id,
			interaction.user.id
		);

		const embed = new EmbedBuilder()
			.setTitle(strings.deleted)
			.setTimestamp(new Date())
			.setColor('#FF0000');

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		})
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: langStrings.responses.unknownInteraction,
			ephemeral: true
		});
	}
}
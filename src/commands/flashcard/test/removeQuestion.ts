import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";
import { Test } from "../../../models/TestModel";

export async function removeQuestion (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.removeQuestion;

	try {
		const test_id = interaction.options.getString('test_id', true);
		const question_id = interaction.options.getString('question_id', true);

		const status = await TestService.removeQuestion(test_id, question_id);

		if (!status) {
			await interaction.reply({
				content: strings.error,
				ephemeral: true
			});
			return;
		}

		const test = await Test.findById(test_id).select('title');
		const testName = test?.title;

		const embed = new EmbedBuilder()
			.setTitle(strings.successTitle)
			.setDescription(
				strings.successDescription
					.replace('{test}', testName)
			)
			.setColor('#00FF00')

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: langStrings.responses.unknownInteraction,
			ephemeral: true
		});
	}
}
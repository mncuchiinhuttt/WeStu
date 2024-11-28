import { ITestQuestion, QuestionType, Test } from "../../../models/Test";
import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";
import { Flashcard } from "../../../models/Flashcard";

export async function listQuestion (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.listQuestion;

	try {
		const test_id = interaction.options.getString('test_id', true);
		const test = await Test.findById(test_id);

		const questions = test?.questions;

		if (!questions || questions.length === 0) {
			await interaction.reply({
				content: strings.noQuestions,
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(strings.successTitle)
			.setDescription(
				strings.description
					.replace('{test}', test.title)
					.replace('{count}', questions.length.toString())
			)

		for (let i = 0; i < questions.length; i++) {
			const question = questions[i] as ITestQuestion;
			const flashcard = await Flashcard.findById(question.flashcardId);
			embed.addFields([{
					name: strings.question.replace('{index}', (i + 1).toString()), 
					value: flashcard?.question ?? strings.noQuestion
				}])
		}

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
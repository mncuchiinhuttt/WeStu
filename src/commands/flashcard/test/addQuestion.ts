import { ITestQuestion, QuestionType, Test } from "../../../models/Test";
import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";

export async function addQuestion (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.addQuestion;

	try {
		const test_id = interaction.options.getString('test_id', true);
		const flashcard_id = interaction.options.getString('flashcard_id', true);
		const points = interaction.options.getInteger('points', true);
		const choice1 = interaction.options.getString('choice1', true);
		const choice2 = interaction.options.getString('choice2');
		const choice3 = interaction.options.getString('choice3');
		const choice4 = interaction.options.getString('choice4');

		let options: string[] = [choice1];
		if (choice2) options.push(choice2);
		if (choice3) options.push(choice3);
		if (choice4) options.push(choice4);

		const question: ITestQuestion = {
			flashcardId: flashcard_id,
			type: QuestionType.MultipleChoice,
			options,
			points
		};

		await TestService.addQuestion(test_id, question);

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
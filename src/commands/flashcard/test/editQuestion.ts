import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";
import { Test } from "../../../models/Test";

export async function editQuestion (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.editQuestion;

	try {
		const test_id = interaction.options.getString('test_id', true);
		const question_id = interaction.options.getString('question_id', true);
		
		const test = await Test.findById(test_id);
		if (!test) {
			await interaction.reply({
				content: strings.testNotFound,
				ephemeral: true
			});
			return;
		}
		const question = test.questions.find((q: any) => q.flashcardId === question_id);
		if (!question) {
			await interaction.reply({
				content: strings.questionNotFound,
				ephemeral: true
			});
			return;
		}
		const points = interaction.options.getInteger('points') ?? question.points;
		const choice1 = interaction.options.getString('choice1') ?? question.options[0] ?? null;
		const choice2 = interaction.options.getString('choice2') ?? question.options[1] ?? null;
		const choice3 = interaction.options.getString('choice3') ?? question.options[2] ?? null;
		const choice4 = interaction.options.getString('choice4') ?? question.options[3] ?? null;
		let choices = [];
		if (choice1) choices.push(choice1);
		if (choice2) choices.push(choice2);
		if (choice3) choices.push(choice3);
		if (choice4) choices.push(choice4);
		const type = question.type;
		const testQuestion = await TestService.updateQuestion(
			test_id, 
			question_id, 
			{
				flashcardId: question_id,
				type,
				options: choices,
				points
			}
		);
		if (!testQuestion) {
			await interaction.reply({
				content: strings.questionNotUpdated,
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(strings.questionUpdated)
			.setDescription(strings.questionUpdatedDesc)
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
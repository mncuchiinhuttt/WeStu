import { LanguageService } from "../../../utils/LanguageService";
import { TestSession } from "../../../models/TestSession";
import { EmbedBuilder } from "discord.js";

export async function incorrectReview (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.incorrectReview;
	
	await interaction.deferReply({ ephemeral: true });

	try {
		const session_id = interaction.options.getString('session_id', true);
		const session = await TestSession.findById(session_id);
		if (!session) {
			await interaction.editReply(strings.sessionNotFound);
			return;
		}
		const incorrectAnswers = session.incorrectAnswersList;
		const totalQuestions = incorrectAnswers.length;
		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(
				strings.description
					.replace('{number}', totalQuestions.toString())
			)
			.setColor('#FF0000')

		for (let i = 0; i < totalQuestions; i++) {
			const question = incorrectAnswers[i];
			embed.addFields(
				{ name: strings.question, value: question.questionText ?? strings.noQuestion },
				{ name: strings.answer, value: question.answer ?? strings.noAnswer }
			);
		}
				
		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error(error);
		await interaction.editReply(strings.error);
	}
}
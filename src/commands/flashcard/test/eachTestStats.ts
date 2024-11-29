import { LanguageService } from "../../../utils/LanguageService";
import { TestSession } from "../../../models/TestSessionModel";
import { EmbedBuilder } from "discord.js";

export async function eachTestStats (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.eachTestStats;
	
	await interaction.deferReply({ ephemeral: true });

	try {
		const test_id = interaction.options.getString('test_id', true);
		const sessions = await TestSession.find({ testId: test_id });

		const stats = {
			totalSessions: sessions.length,
			averageScore: sessions.length ? 
				Math.round(sessions.reduce((acc, session) => acc + (session.score ?? 0), 0) / sessions.length) : 0,
			testsCompleted: sessions.length,
			highestScore: sessions.length ? 
				Math.max(...sessions.map(s => s.score ?? 0)) : 0,
			averageCompletionTime: sessions.length ?
				Math.round(sessions.reduce((acc, s) => acc + s.timeSpent, 0) / sessions.length) : 0
		};

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setColor('#0099ff')
			.addFields(
				{ name: strings.totalSessions, value: stats.totalSessions.toString() },
				{ name: strings.averageScore, value: `${stats.averageScore}` },
				{ name: strings.testsCompleted, value: stats.testsCompleted.toString() },
				{ name: strings.highestScore, value: `${stats.highestScore}` },
				{ name: strings.averageTime, value: `${stats.averageCompletionTime} ${strings.minutes}` }
			)
				
		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error(error);
		await interaction.editReply(strings.error);
	}
}
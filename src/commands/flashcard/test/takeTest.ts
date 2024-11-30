import { LanguageService } from "../../../utils/LanguageService";
import { Component, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { Test } from "../../../models/TestModel";
import { TestSession } from "../../../models/TestSessionModel";
import { Flashcard } from "../../../models/FlashcardModel";

async function sleep (ms: number) {
	let start = Date.now();
	for (let i = 0; i < 1e10; i++) {
		if ((Date.now() - start) > ms) {
			break;
		}
	}
}

export async function takeTest (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.takeTest;

	const startTime = Date.now();

	try {
		const test_id = interaction.options.getString('test_id', true);

		const test = await Test.findById(test_id);
		if (!test) {
			await interaction.reply({
				content: strings.testNotFound,
				ephemeral: true
			});
			return;
		}

		let totalPoints = 0;
		let correctAnswers = 0;

		let incorrectAnswersList = [];
		
		const questions = test.questions;

		await interaction.deferReply({ ephemeral: true });

		const initialEmbed = new EmbedBuilder()
			.setTitle(strings.question)
			.setDescription(strings.starting);

		const initialRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('start')
					.setLabel(strings.start)
					.setStyle(ButtonStyle.Primary)
			);
		
		const initialMessage = await interaction.editReply({
			embeds: [initialEmbed],
			components: [initialRow],
			ephemeral: true
		});

		const userFilter = ((i: any) => i.user.id === interaction.user.id);
		await initialMessage.awaitMessageComponent({ filter: userFilter, time: 60_000 });

		for (let i = 0; i < questions.length; i++) {
			const question = questions[i];
			let fullChoices = question.options ? question.options : [];

			const flashcard = await Flashcard.findById(question.flashcardId);	
			if (!flashcard) {
				await interaction.editReply({
					content: strings.flashcardNotFound,
					ephemeral: true
				});
				return;
			}

			const questionText = flashcard.question;
			const answer = flashcard.answer;
			fullChoices.push(answer);
			const choices = [...fullChoices].sort(() => Math.random() - 0.5);
			
			const embed = new EmbedBuilder()
				.setTitle(`${strings.question} ${i + 1}`)
				.setDescription(`**Q:** ${questionText}`)
				.addFields(
						choices.map((choice, index) => ({
							name: `${index + 1} - ${choice}`,
							value: ' ',
							inline: false
						}))
				);

			const row = new ActionRowBuilder<ButtonBuilder>()

			for (let j = 0; j < choices.length; j++) {
				const button = new ButtonBuilder()
					.setCustomId(`test_${j}`)
					.setLabel(`${j + 1}`)
					.setStyle(ButtonStyle.Primary);
				row.addComponents(button);
			}

			const userFilter = ((i: any) => i.user.id === interaction.user.id);

			if (flashcard.mediaUrl && flashcard.mediaType === 'image') {
				embed.setImage(flashcard.mediaUrl);
			} else if (flashcard.mediaUrl && flashcard.mediaType === 'audio') {
				embed.addFields({ name: strings.audio, value: flashcard.mediaUrl });
			}

			const response = await interaction.editReply({
				embeds: [embed],
				components: [row],
				ephemeral: true
			});

			try {
				const buttonInteraction = await response.awaitMessageComponent({ time: 30_000, filter: userFilter });
				const selectedIndex = parseInt(buttonInteraction.customId.split('_')[1]);
				
				if (choices[selectedIndex] === answer) {
					totalPoints += question.points;
					correctAnswers++;
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setTitle(strings.correctAnswer)
								.setDescription(strings.correct)
								.setColor('#00FF00')
						],
						components: [],
						ephemeral: true
					});
				} else {
					incorrectAnswersList.push({ 
						questionText, 
						answer, 
						userAnswer: choices[selectedIndex] 
					});
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setTitle(strings.incorrectAnswer)
								.setDescription(strings.incorrect)
								.setColor('#FF0000')
						],
						components: [],
						ephemeral: true
					});
				}

				await sleep(2000);
			} catch (e) {
				const timeExpiredEmbed = new EmbedBuilder()
					.setTitle(strings.timeExpired)
					.setDescription(strings.timeExpiredDescription)
					.setColor('#FF0000');

				await interaction.editReply({ 
					embeds: [timeExpiredEmbed],
					ephemeral: true 
				});
				await sleep(2000);
			}
		}

		const percentage = (correctAnswers / questions.length) * 100;
		const testSession = new TestSession({
			testId: test_id,
			userId: interaction.user.id,
			startTime,
			endTime: Date.now(),
			incorrectAnswersList,
			score: totalPoints,
			percentage,
			passed: percentage >= test.passingScore,
			timeSpent: (Date.now() - startTime) / 1000
		});

		await testSession.save();

		const finalEmbed = new EmbedBuilder()
			.setTitle(strings.results)
			.setDescription(strings.resultsDescription)
			.addFields(
				{ name: strings.correctAnswers, value: correctAnswers.toString() },
				{ name: strings.incorrectAnswers, value: incorrectAnswersList.length.toString() },
				{ name: strings.isPassed, value: testSession.passed ? strings.passed : strings.failed },
				{ name: strings.score, value: `${testSession.score}/${test.totalPoints}` },
				{ name: strings.percentage, value: `${testSession.percentage}%` },
				{ name: strings.timeSpent, value: `${testSession.timeSpent} ${strings.seconds}` }
			)
			.setColor(testSession.passed ? '#00FF00' : '#FF0000');
		
		if (incorrectAnswersList.length > 0) {
			finalEmbed.addFields(
				{ name: strings.incorrectAnswersList, value: incorrectAnswersList.map((answer, index) => `**${index + 1}** - **Q: **${answer.questionText}\n**${strings.userAnswer}:** ${answer.userAnswer}\n**${strings.systemAnswer}:** ${answer.answer}`).join('\n') }
			)
		}

		await interaction.editReply({ 
			embeds: [finalEmbed], 
			components: [],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.editReply({
			content: langStrings.responses.unknownInteraction,
			ephemeral: true
		});
	}
}
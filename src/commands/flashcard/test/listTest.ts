import { ITestQuestion, QuestionType, Test } from "../../../models/TestModel";
import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } from "discord.js";
import { Flashcard } from "../../../models/FlashcardModel";

export async function listTest(interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.listTest;

	try {
		await interaction.deferReply({ ephemeral: true });

		const tests = await Test.find({ creator: interaction.user.id });

		if (tests.length === 0) {
			return await interaction.editReply(strings.noTests);
		}

		const itemsPerPage = 5;
		let currentPage = 0;
		const totalPages = Math.ceil(tests.length / itemsPerPage);

		const generateEmbed = (page: number) => {
			const embed = new EmbedBuilder()
				.setTitle(strings.title)
				.setColor('#0099ff')
				.setTimestamp();

			const start = page * itemsPerPage;
			const end = start + itemsPerPage;
			const pageItems = tests.slice(start, end);

			pageItems.forEach((test, index) => {
				embed.addFields({
					name: `${start + index + 1}. ${test.title}`,
					value: `📝 ${strings.questions}: ${test.questions.length}\n⏱️ ${strings.timeLimit}: ${test.timeLimit ?? strings.noLimit}\n📊 ${strings.passingScore}: ${test.passingScore}%`
				});
			});

			embed.setFooter({ text: `Page ${page + 1} of ${totalPages}` });
			return embed;
		};

		const embedMessage = await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [] });

		if (totalPages > 1) {
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(totalPages === 1)
			);

			await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [row] });

			const filter = (i: any) => i.user.id === interaction.user.id;
			const collector = embedMessage.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i: any) => {
				if (i.customId === 'prev') {
					currentPage--;
				} else if (i.customId === 'next') {
					currentPage++;
				}

				const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === 0),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === totalPages - 1)
				);

				await i.update({ embeds: [generateEmbed(currentPage)], components: [newRow] });
			});

			collector.on('end', async () => {
				const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true)
				);
				await interaction.editReply({ components: [disabledRow] });
			});
		}
	} catch (error) {
		console.error(error);
		await interaction.editReply({
			content: langStrings.responses.unknownInteraction,
			ephemeral: true
		});
	}
}
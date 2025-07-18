import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";
import { Test } from "../../../models/TestModel";
import { FlashcardTag } from "../../../models/FlashcardTagModel";

export async function changeSettings (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.changeSettings;

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

		const title = interaction.options.getString('title') ?? test.title;
		const description = interaction.options.getString('description') ?? test.description;
		const timeLimit = interaction.options.getInteger('time_limit') ?? test.timeLimit;
		const passingScore = interaction.options.getInteger('passing_score') ?? test.passingScore;
		const tags = interaction.options.getString('tag_id') ?? test.tags;

		const Tag = await FlashcardTag.findById(tags);
		if (tags && !Tag) {
			const noTagEmbed = new EmbedBuilder()
				.setTitle(strings.tagNotFound)
				.setColor('#ff0000')
				.setTimestamp(Date.now());
			await interaction.reply({
				embeds: [noTagEmbed],
				ephemeral: true
			});
			return;
		}

		await TestService.updateTestSettings(test_id, {
			title,
			description,
			timeLimit,
			passingScore,
			tags
		});

		const tagName = Tag ? Tag.name : strings.noTag;

		const embed = new EmbedBuilder()
			.setTitle(strings.success)
			.setDescription(
				strings.settingsChange
					.replace('{test}', test.title)
			)
			.setColor('#00FF00')
			.addFields(
				{ name: strings.title, value: title },
				{ name: strings.description, value: description },
				{ name: strings.timeLimit, value: timeLimit ? (timeLimit.toString() + 'm') : strings.noTimeLimit },
				{ name: strings.passingScore, value: passingScore ? passingScore.toString() : strings.noPassingScore },
				{ name: strings.tag, value: tagName }
			)
			.setTimestamp(Date.now());

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
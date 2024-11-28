import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";

export async function createTest (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.createTest;

	try {
		const title = interaction.options.getString('title', true);
		const description = interaction.options.getString('description');
		const visibility = interaction.options.getInteger('visibility', true);

		const test = await TestService.createTest(
			title,
			description,
			visibility,
			interaction.user.id
		);

		const visibilityString = visibility === 0 ? strings.private : visibility === 1 ? strings.public : visibility === 2 ? strings.privateAndPublic : strings.groupShared;

		const embed = new EmbedBuilder()
			.setTitle(strings.testCreated)
			.setDescription(
				strings.testCreatedDescription.replace('{name}', title)
			)
			.addFields(
				{ name: strings.title, value: title, inline: true },
				{ name: strings.id, value: test._id.toString(), inline: true },
				{ name: strings.visibility, value: visibilityString, inline: true },
				{ name: strings.creator, value: `<@${interaction.user.id}>`, inline: true }
			)
			.setTimestamp(new Date());

		if (description) {
			embed.addFields(
				{ name: strings.description, value: description }
			);
		}

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
import { LanguageService } from "../../../utils/LanguageService";
import { TestService } from "../../../utils/TestService";
import { EmbedBuilder } from "discord.js";
import { Test } from "../../../models/TestModel";
import { StudyGroup } from "../../../models/StudyGroupModel";

export async function unshareTest (interaction: any) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.unshareTest;

	try {
		const your_test_id = interaction.options.getString('your_test_id', true);
		const group_id = interaction.options.getString('group_id', true);

		const sharedGroups = await Test.findById(your_test_id).select('groupIds');

		if (!sharedGroups?.groupIds.includes(group_id)) {
			const testNotShared_embed = new EmbedBuilder()
				.setTitle(strings.testNotShared)
				.setColor('#FF0000')
				.setTimestamp(Date.now());
			await interaction.reply({
				embeds: [testNotShared_embed],
				ephemeral: true
			});
			return;
		}

		const test = await TestService.unshareTest(
			your_test_id,
			group_id
		);

		if (!test) {
			await interaction.reply({
				content: strings.testNotFound,
				ephemeral: true
			});
			return;
		}
		
		const fetchGroup = await StudyGroup.findById(group_id);
		const fetchTest = await Test.findById(your_test_id);

		const embed = new EmbedBuilder()
			.setTitle(strings.testUnshared)
			.setDescription(
				strings.testUnsharedDescription
					.replace('{name}', fetchTest?.title)
					.replace('{group}', fetchGroup?.name)
			)
			.setColor('#00FF00');

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		})

		const DM_embed = new EmbedBuilder()
			.setTitle(strings.testUnshared)
			.setDescription(
				strings.testUnsharedDescriptionDM
					.replace('{name}', fetchTest?.title)
					.replace('{group}', fetchGroup?.name)
					.replace('{user}', interaction.user.username)
			)
			.setColor('#00FF00');

		const groupMembers = fetchGroup?.members;
		if (!groupMembers) return;
		groupMembers.forEach(async (member: any) => {
			const user = await interaction.guild.members.fetch(member);
			await user.send({
				embeds: [DM_embed]
			})
		});

	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: langStrings.responses.unknownInteraction,
			ephemeral: true
		});
	}
}
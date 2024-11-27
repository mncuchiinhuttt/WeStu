import { Flashcard, Visibility } from "../../models/Flashcard";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction as Interaction, EmbedBuilder } from 'discord.js';
import { LanguageService } from "../../utils/LanguageService";

export async function quiz(interaction: Interaction) {
	const topic = interaction.options.getString('topic') ?? null;
	const visibility = interaction.options.getInteger('visibility');

	const query = Flashcard.findOne();
	query.skip(Math.floor(Math.random() * await Flashcard.countDocuments()));

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.quiz;

	if (topic) query.where('topic').equals(topic);

	switch (visibility) {
		case Visibility.Public:
			query.where('visibility').equals(Visibility.Public);
			break;

		case Visibility.Private:
			query.where('visibility').equals(Visibility.Private);
			query.where('user').equals(interaction.user.id);
			break;

		case Visibility.PrivateAndPublic:
			query.or([
				{ visibility: Visibility.Public },
				{ visibility: Visibility.Private, user: interaction.user.id }
			]);
			break;

		case Visibility.GroupShared:
			query.where('visibility').equals(Visibility.GroupShared);
			break;
	}

	const doc = await query;

	if (!doc) {
		const noFlashcardEmbed = new EmbedBuilder()
			.setTitle(strings.noFlashcards.title)
			.setDescription(strings.noFlashcards.description)
			.setColor(0xFF0000);

		await interaction.reply({ embeds: [noFlashcardEmbed], ephemeral: true });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle(`📝 ${strings.quiz}${topic ? ` ${strings.onTopic} \"${topic}\"` : ""}`)
		.setDescription(`**❓ Q**: ${doc.question}`)
		.setColor(0x00AE86);

	const revealButton = new ButtonBuilder()
		.setCustomId('flashcard-quiz-reveal-answer')
		.setLabel(strings.reveal)
		.setStyle(ButtonStyle.Primary)
		.setEmoji('🔍');

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(revealButton);

	const response = await interaction.reply({
		embeds: [embed],
		components: [row],
	});

	const userFilter = ((i: any) => i.user.id === interaction.user.id);

	try {
		const signalRevealAnswer = await response.awaitMessageComponent({ filter: userFilter, time: 120_000 });

		if (signalRevealAnswer.customId === "flashcard-quiz-reveal-answer") {
			embed.addFields({ name: strings.answer, value: doc.answer });
			await signalRevealAnswer.update({
				embeds: [embed],
				components: []
			});
		}
	} catch (e) {
		await interaction.editReply({
			embeds: [embed],
			components: []
		});
	}
}
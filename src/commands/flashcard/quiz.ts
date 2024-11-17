import { Flashcard, Visibility } from "../../models/Flashcard";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction as Interaction } from 'discord.js';
import messageArray from '../../data/message_array';
import { replyWithArray } from '../../data/message_array';

export async function quiz(interaction: Interaction) {
	const topic = interaction.options.getString('topic') ?? null;
	const visibility = interaction.options.getInteger('visibility');

	const query = Flashcard.findOne();

	if (topic) query.where('topic').equals(topic);

	switch (visibility) {
		case Visibility.Private:
		case Visibility.Public:
			query.where('visibility').equals(visibility);
			break;

		case Visibility.PrivateAndPublic:
			query.where('visibility').in([Visibility.Private, Visibility.Public]);
			break;
	}

	const doc = await query;

	if (doc) {
		const replyArray = new messageArray();
		replyArray.push(`# Quiz${topic ? ` on topic \"${topic}\"` : ""}\n`);
		replyArray.push(`**Q**: ${doc.question}\n`);
		// replyWithArray(interaction, replyArray);

		const revealButton = new ButtonBuilder()
			.setCustomId('flashcard-quiz_reveal-answer')
			.setLabel('Reveal Answer')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(revealButton);

		interaction.reply({
			content: replyArray.get(0),
			components: [row],
		});
	} else {
		interaction.reply("No document found");
	}

}
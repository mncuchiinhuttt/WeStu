import { Flashcard, Visibility } from "../../models/Flashcard";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction as Interaction } from 'discord.js';
import messageArray from '../../data/message_array';

export async function quiz(interaction: Interaction) {
	const topic = interaction.options.getString('topic') ?? null;
	const visibility = interaction.options.getInteger('visibility');

	const query = Flashcard.findOne();

	if (topic) query.where('topic').equals(topic);


	// TODO: Sửa cái đống check điều kiện này lại
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
	}

	const doc = await query;

	if (!doc) {
		interaction.reply("Found no flashcard matching your searching criteria.");
		return;
	}

	const replyArray = new messageArray();
	replyArray.push(`# Quiz${topic ? ` on topic \"${topic}\"` : ""}\n`);
	replyArray.push(`**Q**: ${doc.question}\n`);

	const revealButton = new ButtonBuilder()
		.setCustomId('flashcard-quiz-reveal-answer')
		.setLabel('Reveal Answer')
		.setStyle(ButtonStyle.Primary);

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(revealButton);

	const response = await interaction.reply({
		content: replyArray.get(0),
		components: [row],
	});

	replyArray.push(`**A**: ${doc.answer}`);

	const userFilter = ((i: any) => i.user.id === interaction.user.id);

	try {
		const signalRevealAnswer = await response.awaitMessageComponent({ filter: userFilter, time: 120_000 });

		if (signalRevealAnswer.customId === "flashcard-quiz-reveal-answer") {
			await signalRevealAnswer.update({
				content: replyArray.get(0),
				components: []
			});
		}
	} catch (e) {
		await interaction.editReply({
			content: replyArray.get(0),
			components: []
		});
	}
}
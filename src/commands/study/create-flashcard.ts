import { Flashcard, Visibility } from "../../models/Flashcard";
import { ChatInputCommandInteraction as Interaction } from 'discord.js';
import messageArray from '../../data/message_array';
import { replyWithArray } from '../../data/message_array';

export async function create_flashcard(interaction: Interaction) {
	const question = interaction.options.getString('question');
	const answer = interaction.options.getString('answer');
	const user = interaction.user.id;
	const guild = interaction.guild?.id;
	const visibility = interaction.options.getBoolean('is_public') ? Visibility.Public : Visibility.Private;
	try {
		const flashcard = new Flashcard({ question, answer, user, guild, visibility });
		await flashcard.save();
		const replyArray = new messageArray();
		replyArray.push(`# Flashcard created\n`);
		replyArray.push(`**Q:** ${question}\n`);
		replyArray.push(`**A:** ${answer}\n`);
		replyArray.push(`**Visibility:** ${visibility ? "Public" : "Private"}`);

		replyWithArray(interaction, replyArray);
	} catch (error) {
		console.error('Error creating flashcard:', error);
		await interaction.reply(`There was an error creating the flashcard.`);
	}
}
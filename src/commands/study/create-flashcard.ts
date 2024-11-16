import { Flashcard } from "../../models/Flashcard";
import { ChatInputCommandInteraction as Interaction } from 'discord.js'

export async function create_flashcard ( interaction: Interaction ) {
	const question = interaction.options.getString('question');
	const answer = interaction.options.getString('answer');
	const user = interaction.user.id;
	const guild = interaction.guild?.id;
	const visibility = interaction.options.getBoolean('visibility') ? 0 : 1;
	try {
		const flashcard = new Flashcard({ question, answer, user, guild, visibility });
		await flashcard.save();
		await interaction.reply(`Flashcard created:\n**Q:** ${question}\n**A:** ${answer}`)
	} catch (error) {
		console.error('Error creating flashcard:', error);
		await interaction.reply(`There was an error creating the flashcard.`);
	}
}
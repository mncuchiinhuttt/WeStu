import { Flashcard } from "../../models/Flashcard";

export async function create_flashcard ( { interaction }: any ) {
	const question = interaction.options.getString('question');
	const answer = interaction.options.getString('answer');
	const user = interaction.user.id;
	try {
		const flashcard = new Flashcard({ question, answer, user });
		await flashcard.save();
		await interaction.reply(`Flashcard created:\n**Q:** ${question}\n**A:** ${answer}`)
	} catch (error) {
		console.error('Error creating flashcard:', error);
		await interaction.reply(`There was an error creating the flashcard.`);
	}
}
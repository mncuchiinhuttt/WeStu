import messageArray from "../../data/message_array";
import axios from "axios";

export async function get_flashcard ( { interaction }: any ) {
	const category = interaction.options.getString('category');

	try {
		const response = await axios.get(`https://opentdb.com/api.php?amount=5&category=${encodeURIComponent(category)}&type=multiple`);
		const data = response.data;

		if (data.results.length === 0) {
			await interaction.reply('No flashcards found for that category');
			return;
		}

		const message = new messageArray();

		message.push(`# Flashcards for ${category}\n`);

		data.results.forEach((questionObj: any, index: number) => {
			message.push(`**Q${index + 1}:** ${questionObj.question}\n`);
			message.push(`**Answer:** ${questionObj.correct_answer}\n\n`);
		});

		await interaction.reply(message.get(0));

	} catch (error) {
		console.error(`Error fetching flashcards: ${error}`);
		await interaction.reply('There was an error fetching flashcards.');
	}
}
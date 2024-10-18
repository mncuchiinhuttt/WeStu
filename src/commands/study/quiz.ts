import messageArray from "../../data/message_array";
import axios from "axios";

export async function quiz ( { interaction }: any ) {
	try {
		const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
		const question_data = response.data.results[0];
		const multiple_choice = [...question_data.incorrect_answers, question_data.correct_answer];
		multiple_choice.sort(() => Math.random() - 0.5);
		const message = new messageArray();
		message.push(`** Question: **${question_data.question}\n`);
		multiple_choice.forEach((choice, index) => {
			message.push(`${index + 1}. ${choice}\n`);
		});

		const filter = (response: any) => {
			return response.author.id === interaction.user.id;
		};

		await interaction.reply(message.get(0));
		const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
		const answer = collected?.first()?.content;
		if (multiple_choice[parseInt(answer!) - 1] === question_data.correct_answer) {
			await interaction.followUp('Correct!');
		} else {
			await interaction.followUp(`Wrong! The correct answer was: ${question_data.correct_answer}`);
		}
	} catch (error) {
		console.error(`Error fetching trivia question: `, error);
		await interaction.reply('There was an error fetching the trivia question.');
	}
}
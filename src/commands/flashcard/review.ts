import { ChatInputCommandInteraction as Interaction } from 'discord.js';
import { Visibility } from '../../models/Flashcard';
import { Flashcard } from '../../models/Flashcard';
import { getRandomElements } from '../../utils/random';

export async function review(interaction: Interaction) {
	const quantity = interaction.options.getInteger('quantity');
	const visibility = interaction.options.getInteger('visibility');
	const group_id = interaction.options.getString('group_id'); // Not used yet

	if (visibility == null) {
		await interaction.reply({
			content: 'You must provide a visibility level for this command.',
			ephemeral: true
		});
		return;
	}

	if (quantity == null) {
		await interaction.reply({
			content: 'You must provide a quantity for this command.',
			ephemeral: true
		});
		return;
	}

	// if (group_id == null && visibility in [Visibility.All, Visibility.Group]) {
	// 	await interaction.reply({
	// 		content: 'You must provide a group ID for this visibility level.',
	// 		ephemeral: true
	// 	});
	// 	return;
	// }

	// const query: any = { visibility };
	// if (group_id) {
	// 	query.group_id = group_id;
	// }

	// const flashcards = await Flashcard.find(query, { _id: 1 }).limit(1000);

	const query = Flashcard.find();

	// TODO: Sửa cái đống check điều kiện này lại
	
	switch (visibility) {
		case Visibility.Public:
			query.where('visibility').equals(Visibility.Public);
			break;

		case Visibility.Private:
			query.where('visibility').equals(Visibility.Private);
			query.where('user').equals(interaction.user.id);
			break;

		// case Visibility.All:
		// 	query.or([
		// 		{ visibility: Visibility.Public },
		// 		{ visibility: Visibility.Private, user: interaction.user.id },
		// 		// { visibility: Visibility.Group, group: group_id }
		// 	]);
		// 	break;
	}

	const flashcards = await query;

	if (flashcards.length === 0) {
		await interaction.reply({
			content: 'No flashcards found.',
			ephemeral: true
		});
		return;
	}

	const flashcardIds = flashcards.map(flashcard => flashcard._id);

	const randomIds = getRandomElements(flashcardIds, quantity);

	const randomFlashcards = await Flashcard.find({
		_id: { $in: randomIds }
	});

	await interaction.reply({
		content: `Fetched ${randomFlashcards.length} flashcards. 5 first ID are: ${randomIds.slice(0, 5).join(', ')}`,
		ephemeral: false
	});
}
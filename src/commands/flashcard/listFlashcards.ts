import { EmbedBuilder } from 'discord.js';
import { Flashcard, Visibility } from '../../models/FlashcardModel';
import { StudyGroup } from '../../models/StudyGroupModel';
import moment from 'moment-timezone';
import { LanguageService } from '../../utils/LanguageService';

export async function listFlashcards(interaction: any) {
	const page = interaction.options.getInteger('page') ?? 1;
	const visibility = interaction.options.getInteger('visibility');
	const limit = 5;
	const skip = (page - 1) * limit;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.listFlashcards;

	try {
		let query = Flashcard.find();

		switch (visibility) {
			case Visibility.Private:
				query.where('user').equals(interaction.user.id);
				break;
			case Visibility.Public:
				query.where('visibility').equals(Visibility.Public);
				break;
			case Visibility.GroupShared:
				const userGroups = await StudyGroup.find({ members: interaction.user.id });
				const groupIds = userGroups.map((g: any) => g._id.toString());
				query.where('groupIds').in(groupIds);
				break;
			default:
				const groups = await StudyGroup.find({ members: interaction.user.id });
				const gIds = groups.map((g: any) => g._id.toString());
				query.or([
					{ user: interaction.user.id },
					{ visibility: Visibility.Public },
					{ groupIds: { $in: gIds } }
				]);
		}

		const total = await Flashcard.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		const flashcards = await query
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(
				strings.description
				.replace('{page}', page)
				.replace('{totalPages}', totalPages)
			)
			.setColor('#00ff00')
			.setTimestamp();

		flashcards.forEach((card, index) => {
			const topic = card.topic ? `[${card.topic}]` : '';
			const visibility = card.visibility === Visibility.Public ? '🌐' : 
												card.visibility === Visibility.GroupShared ? '👥' : '🔒';
			embed.addFields({
				name: `${visibility} Flashcard ${skip + index + 1}`,
				value: [
					`**${strings.question}**: ${card.question}`,
					`**${strings.topic}**: ${topic.length > 0 ? topic : strings.none}`,
					`**${strings.created}**: ${moment(card.createdAt).format('YYYY-MM-DD')}`,
					`**ID**: \`${card._id}\``
				].join('\n')
			});
		});

		if (totalPages > 1) {
			embed.setFooter({ text: strings.footer.replace('{totalPages}', totalPages) });
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error listing flashcards:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
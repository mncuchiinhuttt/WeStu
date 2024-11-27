import { Flashcard, Visibility } from "../../models/Flashcard";
import { ChatInputCommandInteraction as Interaction, EmbedBuilder } from 'discord.js';
import messageArray from '../../data/message_array';
import { replyWithArray } from '../../data/message_array';
import { LanguageService } from "../../utils/LanguageService";

export async function create_flashcard(interaction: Interaction) {
	const question = interaction.options.getString('question');
	const answer = interaction.options.getString('answer');
	const topic = interaction.options.getString('topic') ?? null;
	const user = interaction.user.id;
	const guild = interaction.guild?.id;
	const visibility = interaction.options.getBoolean('is_public') ? Visibility.Public : Visibility.Private;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.create_flashcard;

	try {
		const flashcard = new Flashcard({ 
			question: question, 
			answer: answer, 
			topic: topic, 
			user: user, 
			guild: guild, 
			visibility: visibility 
		});
		await flashcard.save();
		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.addFields(
				{ name: '❓ Q', value: question ?? 'N/A', inline: false },
				{ name: '💡 A', value: answer ?? 'N/A', inline: false },
				{ name: strings.topic, value: topic ?? strings.none, inline: false },
				{ name: strings.visibility, value: visibility === Visibility.Public ? strings.public : strings.private, inline: false }
			)
			.setColor(0x00FF00);

		await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch (error) {
		console.error('Error creating flashcard:', error);
		const errorEmbed = new EmbedBuilder()
			.setTitle(strings.error)
			.setDescription(strings.errorDescription)
			.setColor(0xFF0000);
		await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
	}
}
import { Flashcard, Visibility, Difficulty } from "../../models/FlashcardModel";
import { ChatInputCommandInteraction as Interaction, EmbedBuilder } from 'discord.js';
import { LanguageService } from "../../utils/LanguageService";
import { FlashcardTag } from "../../models/FlashcardTagModel";

export async function create_flashcard(interaction: Interaction) {
	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.create_flashcard;

	try {
		const question = interaction.options.getString('question');
		const answer = interaction.options.getString('answer');
		const topic = interaction.options.getString('topic') ?? null;
		const user = interaction.user.id;
		const guild = interaction.guild?.id;
		const visibility = interaction.options.getBoolean('is_public') ? Visibility.Public : Visibility.Private;
		const hints = interaction.options.getString('hints')?.split(',').map(h => h.trim()) ?? [];
		const examples = interaction.options.getString('examples')?.split(',').map(e => e.trim()) ?? [];
		const tagId = interaction.options.getString('tag_id');
		const difficulty = interaction.options.getString('difficulty') ?? Difficulty.Medium;
		const media = interaction.options.getAttachment('media');
	
		let mediaUrl = null;
		let mediaType = null;
	
		if (media) {
			if (media.contentType?.startsWith('image/')) {
				mediaType = 'image';
				mediaUrl = media.url;
			} else if (media.contentType?.startsWith('audio/')) {
				mediaType = 'audio';
				mediaUrl = media.url;
			}
		}
		
		let tag;
		if (tagId) {
			tag = await FlashcardTag.findById(tagId);
			if (!tag) {
				await interaction.reply({ content: strings.tagNotFound, ephemeral: true });
				return;
			}
			await FlashcardTag.findByIdAndUpdate(tagId, { $inc: { usageCount: 1 } });
		}
	
		try {
			const flashcard = new Flashcard({ 
				question: question, 
				answer: answer, 
				topic: topic, 
				user: user, 
				guild: guild, 
				visibility: visibility,
				hints: hints,
				examples: examples,
				tag: tagId,
				difficulty: difficulty,
				mediaUrl: mediaUrl,
				mediaType: mediaType
			});
			await flashcard.save();
	
			const difficultyString = difficulty === Difficulty.Easy ? strings.easy : difficulty === Difficulty.Medium ? strings.medium : strings.hard;
	
			const embed = new EmbedBuilder()
				.setTitle(strings.title)
				.addFields(
					{ name: '❓ Q', value: question ?? 'N/A', inline: false },
					{ name: '💡 A', value: answer ?? 'N/A', inline: false },
					{ name: strings.topic, value: topic ?? strings.none, inline: false },
					{ name: strings.visibility, value: visibility === Visibility.Public ? strings.public : strings.private, inline: false },
					{ name: strings.difficulty, value: difficultyString, inline: true },
					{ name: strings.hints, value: hints.length ? hints.join(', ') : strings.none, inline: true },
					{ name: strings.examples, value: examples.length ? examples.join(', ') : strings.none, inline: true },
					{ name: strings.tag, value: tag ? tag.name : strings.none, inline: true }
				)
				.setColor(0x00FF00);
	
			if (mediaUrl) {
				embed.setImage(mediaType === 'image' ? mediaUrl : null)
					.addFields({ name: strings.media, value: mediaType ?? 'N/A', inline: true });
			}
	
			await interaction.reply({ embeds: [embed], ephemeral: true });
		} catch (error) {
			console.error('Error creating flashcard:', error);
			const errorEmbed = new EmbedBuilder()
				.setTitle(strings.error)
				.setDescription(strings.errorDescription)
				.setColor(0xFF0000);
			await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
	} catch (error) {
		console.error('Error creating flashcard:', error);
		await interaction.reply({ content: langStrings.responses.unknownInteraction, ephemeral: true });
	}
}
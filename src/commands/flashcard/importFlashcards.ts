import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Flashcard, Visibility } from '../../models/FlashcardModel';
import * as fs from 'fs';
import * as readline from 'readline';
import { LanguageService } from '../../utils/LanguageService';

interface FlashcardImport {
	question: string;
	answer: string;
	topic?: string;
	visibility: Visibility;
	difficulty?: string;
	hints?: string[];
	examples?: string[];
	tag?: string;
	mediaUrl?: string;
	mediaType?: string;
}

export async function importFlashcards(interaction: any) {
	const file = interaction.options.getAttachment('file', true);

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.importFlashcards;
	
	if (!file.name?.endsWith('.txt')) {
		await interaction.reply({
			content: strings.invalidFile,
			ephemeral: true
		});
		return;
	}

	try {
		await interaction.deferReply({ ephemeral: true });
		
		const response = await fetch(file.url);
		const arrayBuffer = await response.arrayBuffer();
		const decoder = new TextDecoder('utf-8', { fatal: false });
		const text = decoder.decode(new Uint8Array(arrayBuffer));
		const flashcards: FlashcardImport[] = [];
		
		let currentCard: Partial<FlashcardImport> = {};
		
		const lines = text.split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const [type, ...content] = trimmed.split(':');
			const value = content.join(':').trim();

			switch (type) {
				case 'Q':
					if (currentCard.question) {
						if (currentCard.answer) {
							flashcards.push(currentCard as FlashcardImport);
						}
						currentCard = {};
					}
					currentCard.question = value;
					break;
				case 'A':
					currentCard.answer = value;
					break;
				case 'T':
					currentCard.topic = value;
					break;
				case 'V':
					currentCard.visibility = value.toLowerCase() === 'public' ? 
						Visibility.Public : Visibility.Private;
					break;
					case 'D':
						currentCard.difficulty = value;
						break;
					case 'H':
						currentCard.hints = value.split(';').map(h => h.trim());
						break;
					case 'E':
						currentCard.examples = value.split(';').map(e => e.trim());
						break;
					case 'G':
						currentCard.tag = value;
						break;
					case 'M':
						currentCard.mediaUrl = value;
						break;
					case 'MT':
						currentCard.mediaType = value;
						break;
			}
		}

		if (currentCard.question && currentCard.answer) {
			flashcards.push(currentCard as FlashcardImport);
		}

		if (flashcards.length === 0) {
			await interaction.editReply(strings.invalidFlashcards);
			return;
		}

		const saved = await Promise.all(flashcards.map(card =>
			Flashcard.create({
				question: card.question,
				answer: card.answer,
				topic: card.topic,
				visibility: card.visibility,
				difficulty: card.difficulty,
				hints: card.hints,
				examples: card.examples,
				tag: card.tag,
				mediaUrl: card.mediaUrl,
				mediaType: card.mediaType,
				user: interaction.user.id,
				guild: interaction.guildId
			})
		));

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(strings.description.replace('{length}', saved.length.toString()))
			.addFields(
				{ name: strings.total, value: saved.length.toString() },
				{ name: strings.example, value: strings.exmapleValue }
			)
			.setColor('#00ff00')
			.setTimestamp();

		await interaction.editReply({ embeds: [embed] });

	} catch (error) {
		console.error('Error importing flashcards:', error);
		await interaction.editReply(strings.error);
	}
}
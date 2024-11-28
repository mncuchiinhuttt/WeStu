import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Flashcard, Visibility } from '../../models/Flashcard';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { LanguageService } from '../../utils/LanguageService';

export async function exportFlashcards(interaction: any) {
	const format = interaction.options.getString('format', true);
	const visibility = interaction.options.getInteger('visibility');

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.exportFlashcards;

	try {
		await interaction.deferReply({ ephemeral: true });

		let query = Flashcard.find({ user: interaction.user.id });
		if (visibility !== undefined && visibility !== -1) {
			query = query.where('visibility').equals(visibility);
		}

		const flashcards = await query.sort({ createdAt: -1 });

		if (flashcards.length === 0) {
			await interaction.editReply(strings.noFlashcards);
			return;
		}

		let buffer: Buffer;
		let filename: string;

		switch (format) {
			case 'txt':
				const txtContent = flashcards.map(card => {
					return [
						`Q: ${card.question}`,
						`A: ${card.answer}`,
						card.topic ? `T: ${card.topic}` : '',
						`V: ${card.visibility === Visibility.Public ? 'public' : 'private'}`,
						'',
					].filter(Boolean).join('\n');
				}).join('\n');

				buffer = Buffer.from(txtContent, 'utf-8');
				filename = 'flashcards.txt';
				break;

			case 'csv':
				const fields = ['question', 'answer', 'topic', 'visibility'];
				const parser = new Parser({ fields });
				const csvData = flashcards.map(card => ({
					question: card.question,
					answer: card.answer,
					topic: card.topic || '',
					visibility: card.visibility === Visibility.Public ? 'public' : 'private'
				}));

				buffer = Buffer.from(parser.parse(csvData), 'utf-8');
				filename = 'flashcards.csv';
				break;

			case 'xlsx':
				const workbook = XLSX.utils.book_new();
				const worksheet = XLSX.utils.json_to_sheet(flashcards.map(card => ({
					Question: card.question,
					Answer: card.answer,
					Topic: card.topic ?? '',
					Visibility: card.visibility === Visibility.Public ? 'public' : 'private',
					Created: card.createdAt.toISOString()
				})));

				XLSX.utils.book_append_sheet(workbook, worksheet, 'Flashcards');
				buffer = Buffer.from(XLSX.write(workbook, { type: 'buffer' }));
				filename = 'flashcards.xlsx';
				break;

			default:
				await interaction.editReply(strings.invalidFormat);
				return;
		}

		const attachment = new AttachmentBuilder(buffer, { name: filename });

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(
				strings.description
					.replace('{flashcards}', flashcards.length.toString())
			)
			.addFields(
				{ name: strings.format, value: format.toUpperCase() },
				{ name: strings.cardExport, value: flashcards.length.toString() }
			)
			.setColor('#00ff00')
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed],
			files: [attachment]
		});

	} catch (error) {
		console.error('Error exporting flashcards:', error);
		await interaction.editReply(strings.error);
	}
}
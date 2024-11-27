import { CommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function importHelp(interaction: any) {
	const sampleContent = 
`# Flashcard Import Format Guide
# Use Q: for questions, A: for answers
# T: for topic (optional), V: for visibility (public/private)
# Leave a blank line between cards

Q: What is the capital of France?
A: Paris
T: Geography
V: public

Q: What is 2+2?
A: 4
T: Math
V: private

Q: What is the main purpose of TypeScript?
A: TypeScript adds static typing to JavaScript
T: Programming
V: public`;

	const buffer = Buffer.from(sampleContent, 'utf-8');
	const attachment = new AttachmentBuilder(buffer, {
		name: 'sample_flashcards.txt',
		description: 'Sample flashcards import file'
	});

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.importHelp;

	const embed = new EmbedBuilder()
		.setTitle(strings.title)
		.setDescription(strings.description)
		.addFields(
			{
				name: strings.format.title,
				value: strings.format.description.join('\n')
			},
			{
				name: strings.tips.title,
				value: strings.tips.description.join('\n')
			},
			{
				name: strings.issues.title,
				value: strings.issues.description.join('\n')
			},
			{
				name: strings.example.title,
				value: '```\nQ: What is TypeScript?\nA: A superset of JavaScript\nT: Programming\nV: public\n```'
			}
		)
		.setColor('#00ff00')
		.setTimestamp();

	await interaction.reply({
		embeds: [embed],
		files: [attachment],
		ephemeral: true
	});
}
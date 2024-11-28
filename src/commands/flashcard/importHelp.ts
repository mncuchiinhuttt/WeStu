import { CommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { LanguageService } from '../../utils/LanguageService';

export async function importHelp(interaction: any) {
  const sampleContent = 
`# Flashcard Import Format Guide
# Required fields:
# Q: Question
# A: Answer
#
# Optional fields:
# T: Topic
# V: Visibility (public/private)
# D: Difficulty (easy/medium/hard)
# H: Hints (separate multiple with semicolon)
# E: Examples (separate multiple with semicolon)
# G: Tag ID
# M: Media URL (image or audio)
# MT: Media Type (image/audio)
#
# Leave a blank line between cards

Q: What is the capital of France?
A: Paris
T: Geography
V: public
D: easy
H: Think of the Eiffel Tower; Most populated city in France
E: The Louvre is in Paris; Paris hosts many international events
G: 507f1f77bcf86cd799439011
M: https://example.com/paris.jpg
MT: image

Q: What is TypeScript?
A: A superset of JavaScript that adds static typing
T: Programming
V: private
D: medium
H: Made by Microsoft; Compiles to JavaScript
E: interface User { id: number; name: string; }
G: 507f1f77bcf86cd799439012

Q: What is the theory of relativity?
A: E = mc²
T: Physics
V: public
D: hard
H: Developed by Einstein; Relates mass and energy
E: Light bends near massive objects; Time dilation in space
G: 507f1f77bcf86cd799439013`;

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
				value: '```\nQ: What is Git?\nA: A distributed version control system\nT: Programming\nV: public\nD: medium\nH: Created by Linus Torvalds\nE: git commit -m "example"\nG: 507f1f77bcf86cd799439014\n```'
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
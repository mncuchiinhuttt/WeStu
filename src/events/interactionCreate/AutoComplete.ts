import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { Interaction } from 'discord.js';
import { elementNameOptions, elementSymbolOptions } from '../../data/chemical-elements/elementNameCommandOptions';
import Trivia_API_Categories from '../../data/trivia-api-categories.json';
import Deep_Translate_Languages from '../../data/deep-translate-language.json';
import { Task } from '../../models/Task';
import { StudyResource } from '../../models/StudyResource';
import { StudyGroup } from '../../models/StudyGroup';
import { Flashcard, Visibility } from '../../models/Flashcard';
import { FlashcardTag } from '../../models/FlashcardTag';

const autoCompleteCommandName = ['lookup', 'element', 'study', 'translate', 'todo', 'group', 'flashcard'];

async function wiktionaryAutoComplete (interaction: any, focusedValue: any) {
	if (focusedValue.name === 'language') {
		const filteredLanguages = wiktionaryLanguages.filter((language: any) => 
			language.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredLanguages.map((language: any) => {
			return {
				name: `${language.name} - ${language.id}`,
				value: language.id,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

async function elementAutoComplete (interaction: any, focusedValue: any) {
	if (focusedValue.name === 'name') {
		const filteredElements = elementNameOptions.filter((element: any) => 
			element.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredElements.map((element: any) => {
			return {
				name: `${element.name} - ${element.value}`,
				value: element.value,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	} else if (focusedValue.name === 'symbol') {
		const filteredElements = elementSymbolOptions.filter((element: any) => 
			element.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredElements.map((element: any) => {
			return {
				name: `${element.name} - ${element.value}`,
				value: element.value,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

async function studyAutoComplete (interaction: any, focusedValue: any) {
	const subcommand = interaction.options.getSubcommand();
	if (subcommand === 'resources') {
		if (focusedValue.name === 'resource_id') {
			// Handle autocomplete for resource_id
			try {
				const userId = interaction.user.id;
				const resources = await StudyResource.find({
					userId,
					title: { $regex: new RegExp(focusedValue.value, 'i') },
				}).limit(25);

				const results = resources.map((resource: any) => ({
					name: resource.title,
					value: resource._id.toString(),
				}));

				await interaction.respond(results);
			} catch (error) {
				console.error('Error in resource autocomplete:', error);
				await interaction.respond([]);
			}
		}
	} else if (focusedValue.name === 'category') {
		// Existing code for handling 'category'
		const filteredCategories = Trivia_API_Categories.filter((category: any) =>
			category.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);

		const results = filteredCategories.map((category: any) => ({
			name: category.name,
			value: category.id,
		}));

		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

async function translateAutoComplete (interaction: any, focusedValue: any) {
	if (focusedValue.name === 'orginal_language') {
		const filteredCategories = Deep_Translate_Languages.filter((language: any) => 
			language.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredCategories.map((language: any) => {
			return {
				name: `${language.name}`,
				value: language.language,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	} else if (focusedValue.name === 'target_language') {
		const filteredCategories = Deep_Translate_Languages.filter((language: any) => 
			language.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredCategories.map((language: any) => {
			return {
				name: `${language.name}`,
				value: language.language,
			};
		});
	
		interaction.respond(results.slice(0, 25)).catch(() => {});
	}
}

async function todoAutoComplete (interaction: any, focusedValue: any) {
	if (focusedValue.name === 'task_id') {
		try {
			// Get user's tasks, prioritize pending ones
			const tasks = await Task.find({ 
				userId: interaction.user.id 
			}).sort({ 
				status: 1, // Pending first
				deadline: 1  // Earlier deadlines first
			}).limit(25);

			const results = tasks.map(task => {
				const deadline = task.deadline.toLocaleDateString();
				const status = task.status === 'completed' ? '✅' : '⏳';
				
				return {
					name: `${status} ${task.title} (Due: ${deadline})`,
					value: task._id.toString()
				};
			});

			await interaction.respond(
				results.filter(task => 
					task.name.toLowerCase().includes(focusedValue.value.toLowerCase())
				).slice(0, 25)
			);
			
		} catch (error) {
			console.error('Error in todo autocomplete:', error);
			await interaction.respond([]);
		}
	}
	if (focusedValue.name === 'template_name') {
	try {
		const templates = await Task.find({
		userId: interaction.user.id,
		template: true
		});
	
		const results = templates.map(template => ({
		name: template.templateName,
		value: template.templateName
		}));
	
		await interaction.respond(
		results.filter(template => 
			template.name?.toLowerCase().includes(focusedValue.value.toLowerCase())
		).slice(0, 25)
		);
		
	} catch (error) {
		console.error('Error in template autocomplete:', error);
		await interaction.respond([]);
	}
	}
}

async function groupAutoComplete(interaction: any, focusedValue: any) {
	if (focusedValue.name === 'group_id') {
		try {
			const groups = await StudyGroup.find({
				$or: [
					{ members: interaction.user.id },
					{ ownerId: interaction.user.id }
				]
			}).sort({ createdAt: -1 }).limit(25);

			const results = groups.map(group => {
				const isOwner = group.ownerId === interaction.user.id;
				const memberCount = group.members.length;
				
				return {
					name: `${isOwner ? '👑' : '👤'} ${group.name} (${memberCount} members)`,
					value: (group._id as string)
				};
			});

			await interaction.respond(
				results.filter(group =>
					group.name.toLowerCase().includes(focusedValue.value.toLowerCase())
				).slice(0, 25)
			);

		} catch (error) {
			console.error('Error in group autocomplete:', error);
			await interaction.respond([]);
		}
	}
}

async function flashcardAutoComplete(interaction: any, focusedValue: any) {
	if (focusedValue.name === 'flashcard_id') {
		try {
			const flashcards = await Flashcard.find({ 
				user: interaction.user.id 
			}).sort({ 
				createdAt: -1 
			}).limit(25);

			const results = flashcards.map(card => {
				const topic = card.topic ? `[${card.topic}] ` : '';
				const preview = card.question.length > 30 
					? card.question.substring(0, 30) + '...' 
					: card.question;
				
				return {
					name: `${topic}${preview}`,
					value: card._id.toString()
				};
			});

			await interaction.respond(
				results.filter(card => 
					card.name.toLowerCase().includes(focusedValue.value.toLowerCase())
				).slice(0, 25)
			);

		} catch (error) {
			console.error('Error in flashcard autocomplete:', error);
			await interaction.respond([]);
		}
	} else if (focusedValue.name === 'group_id') {
		try {
			const groups = await StudyGroup.find({
				$or: [
					{ members: interaction.user.id },
					{ ownerId: interaction.user.id }
				]
			}).sort({ createdAt: -1 }).limit(25);

			const results = groups.map(group => {
				const isOwner = group.ownerId === interaction.user.id;
				const memberCount = group.members.length;
				
				return {
					name: `${isOwner ? '👑' : '👤'} ${group.name} (${memberCount} members)`,
					value: (group._id as string)
				};
			});

			await interaction.respond(
				results.filter(group =>
					group.name.toLowerCase().includes(focusedValue.value.toLowerCase())
				).slice(0, 25)
			);

		} catch (error) {
			console.error('Error in group autocomplete:', error);
			await interaction.respond([]);
		}
	} else if (focusedValue.name === 'flashcard_id_show') {
		try {
			// Get user's groups
			const userGroups = await StudyGroup.find({ members: interaction.user.id });
			const groupIds = userGroups.map((g: any) => g._id.toString());

			// Query all accessible flashcards
			const flashcards = await Flashcard.find({
				$or: [
					{ user: interaction.user.id },
					{ visibility: Visibility.Public },
					{ 
						visibility: Visibility.GroupShared,
						groupIds: { $in: groupIds }
					}
				]
			})
			.sort({ createdAt: -1 })
			.limit(25);

			const results = flashcards.map(card => {
				// Add visibility icon
				const visibility = card.user === interaction.user.id ? '🔒' : 
												 card.visibility === Visibility.Public ? '🌐' : '👥';
				
				const topic = card.topic ? `[${card.topic}] ` : '';
				const preview = card.question.length > 30 
					? card.question.substring(0, 30) + '...' 
					: card.question;

				return {
					name: `${visibility} ${topic}${preview}`,
					value: card._id.toString()
				};
			});

			await interaction.respond(
				results.filter(card => 
					card.name.toLowerCase().includes(focusedValue.value.toLowerCase())
				).slice(0, 25)
			);

		} catch (error) {
			console.error('Error in flashcard show autocomplete:', error);
			await interaction.respond([]);
		}
	} else if (focusedValue.name === 'tag_id') {
		try {
			const tags = await FlashcardTag.find({
				name: { 
					$regex: new RegExp(focusedValue.value, 'i') 
				}
			}).limit(25);

			return interaction.respond(
				tags.map((tag: any) => ({
					name: tag.name,
					value: tag._id.toString()
				}))
			);
		} catch (error) {
			console.error('Error in tag autocomplete:', error);
			return interaction.respond([]);
		}
	}
}

export default async function (interaction: Interaction) {	
	if (!interaction.isAutocomplete()) return;
	if (!autoCompleteCommandName.includes(interaction.commandName)) return;

	const focusedValue = interaction.options.getFocused(true);

	switch (interaction.commandName) {
		case 'lookup':
			await wiktionaryAutoComplete(interaction, focusedValue);
			break;
		case 'element':
			await elementAutoComplete(interaction, focusedValue);
			break;
		case 'study':
			await studyAutoComplete(interaction, focusedValue);
			break;
		case 'translate':
			await translateAutoComplete(interaction, focusedValue);
			break;
		case 'todo':
			await todoAutoComplete(interaction, focusedValue);
			break;
		case 'group':
			await groupAutoComplete(interaction, focusedValue);
			break;
		case 'flashcard':
			await flashcardAutoComplete(interaction, focusedValue);
			break;
	}
};
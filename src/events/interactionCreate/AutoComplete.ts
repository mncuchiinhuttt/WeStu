import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { Interaction } from 'discord.js';
import { elementNameOptions, elementSymbolOptions } from '../../data/chemical-elements/elementNameCommandOptions';
import Trivia_API_Categories from '../../data/trivia-api-categories.json';
import Deep_Translate_Languages from '../../data/deep-translate-language.json';
import { Task } from '../../models/TaskModel';
import { StudyResource } from '../../models/StudyResourceModel';
import { StudyGroup } from '../../models/StudyGroupModel';
import { Flashcard, Visibility } from '../../models/FlashcardModel';
import { FlashcardTag } from '../../models/FlashcardTagModel';
import { Test, ITestQuestion } from '../../models/TestModel';
import { LanguageService } from '../../utils/LanguageService';
import { TestSession } from '../../models/TestSessionModel';

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
				$or: [
					{ user: interaction.user.id },
					{ visibility: Visibility.Public }
				]
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
			const userGroups = await StudyGroup.find({ members: interaction.user.id });
			const groupIds = userGroups.map((g: any) => g._id.toString());

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
	} else if (focusedValue.name === 'test_id') {
		try {
				const tests = await Test.find({
						$or: [
								{ creator: interaction.user.id },
								{ visibility: Visibility.Public }
						],
						title: {
								$regex: new RegExp(focusedValue.value, 'i')
						}
				})
				.sort({ createdAt: -1 })
				.limit(25);

				const results = tests.map(test => {
						const visibility = test.creator === interaction.user.id ? '🔒' : '🌐';
						const questionCount = test.questions.length;
						const timeString = test.timeLimit ? `⏱️${test.timeLimit}m` : '⏱️∞';
						
						return {
								name: `${visibility} ${test.title} (${questionCount}Q, ${timeString}, ${test.passingScore}%)`,
								value: test._id.toString()
						};
				});

				await interaction.respond(
						results.filter(test => 
								test.name.toLowerCase().includes(focusedValue.value.toLowerCase())
						).slice(0, 25)
				);

		} catch (error) {
				console.error('Error in test autocomplete:', error);
				await interaction.respond([]);
		}
	} else if (focusedValue.name === 'your_test_id') {
		try {
				const tests = await Test.find({
						$or: [
								{ creator: interaction.user.id },
						],
						title: {
								$regex: new RegExp(focusedValue.value, 'i')
						}
				})
				.sort({ createdAt: -1 })
				.limit(25);

				const results = tests.map(test => {
						const questionCount = test.questions.length;
						const timeString = test.timeLimit ? `⏱️${test.timeLimit}m` : '⏱️∞';
						
						return {
								name: `🔒 ${test.title} (${questionCount}Q, ${timeString}, ${test.passingScore}%)`,
								value: test._id.toString()
						};
				});

				await interaction.respond(
						results.filter(test => 
								test.name.toLowerCase().includes(focusedValue.value.toLowerCase())
						).slice(0, 25)
				);

		} catch (error) {
				console.error('Error in test autocomplete:', error);
				await interaction.respond([]);
		}
	} else if (focusedValue.name === 'question_id') {
		try {
			const languageService = LanguageService.getInstance();
			const userLang = await languageService.getUserLanguage(interaction.user.id);
			const langStrings = require(`../../data/languages/${userLang}.json`);
			const strings = langStrings.events.interactionCreate.autoComplete.flashcard.question;

			const test_id = interaction.options.getString('test_id', true);
			if (!test_id) return interaction.respond([]);
			const test = await Test.findById(test_id);
			if (!test || !test.questions.length) 
				return interaction.respond([]);
			const questionsWithDetails = await Promise.all(
				test.questions.map(async (question: ITestQuestion, index: number) => {
						const flashcard = await Flashcard.findById(question.flashcardId);
						return {
							index: index + 1,
							id: question.flashcardId,
							question: flashcard?.question ?? strings.unknownQuestion,
							points: question.points
						};
				})
			);

			const results = questionsWithDetails.map(q => ({
					name: `Q${q.index}: ${q.question.substring(0, 50)}... (${q.points}pts)`,
					value: q.id.toString()
			}));

			await interaction.respond(
					results.filter(q => 
							q.name.toLowerCase().includes(focusedValue.value.toLowerCase())
					).slice(0, 25)
			);
		} catch (error) {
			console.log('Error in question autocomplete:', error);
			await interaction.respond([]);
		}
	} else if (focusedValue.name === 'session_id') {
		try {
				const sessions = await TestSession.find({ 
						userId: interaction.user.id 
				})
				.sort({ startTime: -1 })
				.limit(25);

				const sessionsWithDetails = await Promise.all(
						sessions.map(async (session) => {
								const test = await Test.findById(session.testId);
								return {
										id: session._id,
										testTitle: test?.title ?? 'Unknown Test',
										score: session.score,
										percentage: session.percentage,
										date: session.startTime.toLocaleDateString(),
										passed: session.passed
								};
						})
				);

				const results = sessionsWithDetails.map(session => ({
						name: `${session.passed ? '✅' : '❌'} ${session.testTitle} - ${session.percentage}% (${session.date})`,
						value: session.id.toString()
				}));

				await interaction.respond(
						results.filter(session => 
								session.name.toLowerCase().includes(focusedValue.value.toLowerCase())
						).slice(0, 25)
				);

		} catch (error) {
				console.error('Error in session autocomplete:', error);
				await interaction.respond([]);
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
import wiktionaryLanguages from '../../data/wiktionarLanguages.json';
import { Interaction } from 'discord.js';
import { elementNameOptions, elementSymbolOptions } from '../../data/chemical-elements/elementNameCommandOptions';
import Trivia_API_Categories from '../../data/trivia-api-categories.json';
import Deep_Translate_Languages from '../../data/deep-translate-language.json';
import { Task } from '../../models/Task';

const autoCompleteCommandName = ['lookup', 'element', 'study', 'translate', 'todo'];

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
	if (focusedValue.name === 'category') {
		const filteredCategories = Trivia_API_Categories.filter((category: any) => 
			category.name.toLowerCase().startsWith(focusedValue.value.toLowerCase())
		);
	
		const results = filteredCategories.map((category: any) => {
			return {
				name: `${category.name}`,
				value: category.id,
			};
		});
	
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
	}
};
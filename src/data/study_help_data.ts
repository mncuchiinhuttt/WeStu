export const studyHelpData = [
	{ 
		"name": "schedule", 
		"description": "Schedule a study session", 
		"options": {
			"topic": "The topic to study",
			"time": "The time for the session (in HH:MM format)",
			"date": "The date for the session (in YYYY-MM-DD format)",
			"participant": "The partner for the study with you",
		}
	},
	{
		"name": "create-flashcard",
		"description": "Create your own flashcard.",
		"options": {
			"question": "The question for the flashcard",
			"answer": "The answer for the flashcard"
		}
	},
	{
		"name": "get-flashcard",
		"description": "Get a flashcard from Trivia API",
		"options": {
			"category": "The category of the flashcard"
		}
	},
	{
		"name": "quiz",
		"description": "Take a quiz with a random flashcard or trivia question",
	}
];
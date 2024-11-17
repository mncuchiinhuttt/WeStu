import mongoose from 'mongoose';

export enum Visibility {
	Private = 0,
	Public = 1,
	PrivateAndPublic = 2,
	Global = 3
}

const flashcardSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	answer: {
		type: String,
		required: true
	},
	topic: {
		type: String,
		required: false,
		default: null
	},
	user: {
		type: String,
		required: true
	},
	guild: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	},
	visibility: {
		type: Number,
		default: Visibility.Private,
		required: true
	},
	approved: {
		type: Boolean,
		required: false
	}
});


export const Flashcard = mongoose.model('Flashcard', flashcardSchema);

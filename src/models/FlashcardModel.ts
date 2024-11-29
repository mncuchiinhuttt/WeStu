import mongoose from 'mongoose';

export enum Visibility {
	Private = 0,
	Public = 1,
	PrivateAndPublic = 2,
	GroupShared = 3
}

export enum Difficulty {
	Easy = 'easy',
	Medium = 'medium',
	Hard = 'hard'
}

const flashcardSchema = new mongoose.Schema({
	question: { type: String, required: true },
	answer: { type: String, required: true },
	topic: { type: String, required: false, default: null },
	user: { type: String, required: true },
	guild: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, required: true },
	visibility: { type: Number, default: Visibility.Private, required: true },
	approved: { type: Boolean, required: false },
	groupIds: [{ type: String }],
	mediaUrl: { type: String, required: false, default: null },
	mediaType: { type: String, enum: ['image', 'audio', null], required: false, default: null },
	hints: { type: [String], required: false, default: [] },
	examples: { type: [String], required: false, default: [] },
	tag: { type: String, required: false, default: null },
	difficulty: { type: String, required: false, default: Difficulty.Medium }
});

export const Flashcard = mongoose.model('Flashcard', flashcardSchema);
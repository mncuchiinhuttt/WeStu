import mongoose from 'mongoose';

export interface IFlashcardTag extends mongoose.Document {
	name: string;
	createdBy: string;
	createdAt: Date;
	usageCount: number;
}

const flashcardTagSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	createdBy: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	usageCount: { type: Number, default: 0 }
});

export const FlashcardTag = mongoose.model<IFlashcardTag>('FlashcardTag', flashcardTagSchema);
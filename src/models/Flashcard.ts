import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
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
		default: 0,
		required: true
	},
});

export const Flashcard = mongoose.model('Flashcard', flashcardSchema);

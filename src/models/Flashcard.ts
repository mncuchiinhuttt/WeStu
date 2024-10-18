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
    type: String, // Discord user ID
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Flashcard = mongoose.model('Flashcard', flashcardSchema);

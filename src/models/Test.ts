import mongoose from 'mongoose';
import { Visibility } from './Flashcard';

export enum QuestionType {
  MultipleChoice = 'multiple_choice',
  Typing = 'typing',
  Matching = 'matching'
}

export interface ITestQuestion {
  flashcardId: string;
  type: QuestionType;
  options?: string[];
  matchingPairs?: { left: string; right: string; }[];
  points: number;
}

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  creator: { type: String, required: true },
  visibility: { type: Number, default: Visibility.Private },
  groupIds: [String],
  questions: [{
    flashcardId: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(QuestionType),
      required: true 
    },
    options: [String],
    points: { type: Number, default: 1 }
  }],
  totalPoints: { type: Number, default: 0 },
  timeLimit: Number, 
  passingScore: { type: Number, default: 60 },
  tags: String,
  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});

export const Test = mongoose.model('Test', testSchema);
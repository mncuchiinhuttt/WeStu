import mongoose from 'mongoose';

const testSessionSchema = new mongoose.Schema({
	testId: { type: String, required: true },
	userId: { type: String, required: true },
	startTime: { type: Date, default: Date.now },
	endTime: Date,
	incorrectAnswersList: [{
		questionText: String,
		answer: String,
		userAnswer: String
	}],
	score: Number,
	percentage: Number,
	passed: Boolean,
	timeSpent: { type: Number, require: false, default: 0 }, 
});

export const TestSession = mongoose.model('TestSession', testSessionSchema);
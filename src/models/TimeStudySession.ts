import mongoose from 'mongoose';

const timeStudySessionSchema = new mongoose.Schema({
	userId: {
		type: String, 
		required: true 
	},
	beginTime: {
		type: Date, 
		required: true 
	},
	finishTime: { 
		type: Date 
	},
	duration: { 
		type: Number 
	}
});

export const TimeStudySession = mongoose.model('TimeStudySession', timeStudySessionSchema);
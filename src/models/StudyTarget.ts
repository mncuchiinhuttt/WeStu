import mongoose from 'mongoose';

const studyTargetSchema = new mongoose.Schema({
	userId: { 
		type: String, 
		required: true, 
		unique: true 
	},
	weeklyTarget: { 
		type: Number, 
		required: true 
	}, // hours per week
	dailyMinimum: { 
		type: Number, 
		required: true 
	}, // hours per day
	createdAt: { 
		type: Date, 
		default: Date.now 
	},
	updatedAt: { 
		type: Date, 
		default: Date.now 
	}
});

export const StudyTarget = mongoose.model('StudyTarget', studyTargetSchema);
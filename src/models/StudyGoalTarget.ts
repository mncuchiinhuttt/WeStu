// src/models/StudyGoalTarget.ts
import mongoose from 'mongoose';

enum GoalPriority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high'
}

enum GoalCategory {
	DAILY = 'daily',
	WEEKLY = 'weekly',
	MONTHLY = 'monthly',
	CUSTOM = 'custom'
}

export enum GoalStatus {
	ACTIVE = 'active',
	COMPLETED = 'completed',
	FAILED = 'failed',
	IN_PROGRESS = 'in_progress'
}

const milestoneSchema = new mongoose.Schema({
	description: String,
	targetValue: Number,
	currentValue: { type: Number, default: 0 },
	completed: { type: Boolean, default: false },
	completedAt: Date
});

const studyGoalTargetSchema = new mongoose.Schema({
	userId: { 
		type: String, 
		required: true 
	},
	description: { 
		type: String, 
		required: true 
	},
	category: {
		type: String,
		enum: Object.values(GoalCategory),
		required: true
	},
	priority: {
		type: String,
		enum: Object.values(GoalPriority),
		default: GoalPriority.MEDIUM
	},
	status: {
		type: String,
		enum: Object.values(GoalStatus),
		default: GoalStatus.ACTIVE
	},
	targetHours: {
		type: Number,
		required: true
	},
	currentHours: {
		type: Number,
		default: 0
	},
	deadline: Date,
	startDate: {
		type: Date,
		default: Date.now
	},
	completedAt: Date,
	recurring: {
		type: Boolean,
		default: false
	},
	recurrenceInterval: String, // daily, weekly, monthly
	milestones: [milestoneSchema],
	streakCount: {
		type: Number,
		default: 0
	},
	bestStreak: {
		type: Number,
		default: 0
	},
	lastStudyDate: Date
});

export const StudyGoalTarget = mongoose.model('StudyGoalTarget', studyGoalTargetSchema);
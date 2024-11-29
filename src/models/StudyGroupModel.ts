import mongoose from 'mongoose';

export interface IStudyGroup extends mongoose.Document {
	name: string;
	ownerId: string;
	members: string[];
	description?: string;
	createdAt: Date;
	totalStudyTime: number;
	groupImage?: string;
	isActive: boolean;
}

const studyGroupSchema = new mongoose.Schema({
	name: { type: String, required: true },
	ownerId: { type: String, required: true },
	members: [{ type: String }],
	description: { type: String },
	createdAt: { type: Date, default: Date.now },
	totalStudyTime: { type: Number, default: 0 },
	groupImage: { type: String },
	isActive: { type: Boolean, default: true }
});

export const StudyGroup = mongoose.model<IStudyGroup>('StudyGroup', studyGroupSchema);
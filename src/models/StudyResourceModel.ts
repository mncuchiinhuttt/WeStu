import { Schema, model } from 'mongoose';

interface IStudyResource {
    userId: string;
    title: string;
    description?: string;
    link?: string;
    shareWithServer: boolean;
    createdAt: Date;
}

const studyResourceSchema = new Schema<IStudyResource>({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    shareWithServer: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const StudyResource = model<IStudyResource>('StudyResource', studyResourceSchema);
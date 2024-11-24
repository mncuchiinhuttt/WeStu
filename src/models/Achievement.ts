import { Schema, model, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: string;
  name: string;
  date: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export const Achievement = model<IAchievement>('Achievement', AchievementSchema);
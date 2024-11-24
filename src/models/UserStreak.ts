import { Schema, model, Document } from 'mongoose';

export interface IUserStreak extends Document {
  userId: string;
  currentStreak: number;
  lastStudied: Date;
  longestStreak: number;
}

const UserStreakSchema = new Schema<IUserStreak>({
  userId: { type: String, required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  lastStudied: { type: Date, default: null },
  longestStreak: { type: Number, default: 0 },
});

export const UserStreak = model<IUserStreak>('UserStreak', UserStreakSchema);
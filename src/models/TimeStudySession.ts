import { Schema, model, Document } from 'mongoose';

export interface ITimeStudySession extends Document {
  userId: string;
  beginTime?: Date;
  finishTime?: Date;
  duration: number; // in seconds
  isPomodoro: boolean;
  pomodoroConfig?: {
    studyDuration: Number,
    breakDuration: Number,
    plannedSessions: Number,
    completedSessions: Number,
  };
  subject?: string; // New field for 'Explorer' achievement
  hasBreak?: boolean; // New field for 'Focused' and 'Deep Thinker' achievements
  missedStreakDays?: number; // For 'Perseverance' achievement
  scheduledTime?: Date; // Optional
  scheduledStartNotified?: boolean; // Optional
  missed?: boolean; // Optional
}

const TimeStudySessionSchema = new Schema<ITimeStudySession>({
  userId: { type: String, required: true, index: true },
  beginTime: { type: Date },
  finishTime: { type: Date },
  duration: { type: Number, default: 0 },
  isPomodoro: { type: Boolean, default: false },
  pomodoroConfig: { type: Schema.Types.Mixed },
  subject: { type: String }, // Optional
  hasBreak: { type: Boolean, default: false }, // Optional
  missedStreakDays: { type: Number, default: 0 }, // Optional
  scheduledTime: { type: Date }, // Optional
  scheduledStartNotified: { type: Boolean, default: false }, // Optional
  missed: { type: Boolean, default: false }, // Optional
});

export const TimeStudySession = model<ITimeStudySession>('TimeStudySession', TimeStudySessionSchema);
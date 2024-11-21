import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  deadline: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  time: { type: String, required: true },
  days: [String],
  active: { type: Boolean, default: true }
});

const subjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  totalHours: { type: Number, default: 0 },
  lastStudied: Date
});

export const StudyGoal = mongoose.model('StudyGoal', goalSchema);
export const StudyNote = mongoose.model('StudyNote', noteSchema);
export const StudyReminder = mongoose.model('StudyReminder', reminderSchema);
export const StudySubject = mongoose.model('StudySubject', subjectSchema);
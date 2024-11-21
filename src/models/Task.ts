import mongoose from 'mongoose';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  priority: { 
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM
  },
  status: {
    type: String, 
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING
  },
  subject: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  reminderSent: { type: Boolean, default: false }
});

export const Task = mongoose.model('Task', taskSchema);
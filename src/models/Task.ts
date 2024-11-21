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

interface ISubtask {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

const subtaskSchema = new mongoose.Schema<ISubtask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

interface IComment {
  userId: string;
  username: string; 
  content: string;
  createdAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
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
  subtasks: [subtaskSchema],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,  // Already set correctly
    required: true
  },
  category: String,
  tags: [String],
  sharedWith: [String],
  estimatedHours: Number,
  actualHours: Number,
  recurringFrequency: String,
  recurringParentId: mongoose.Schema.Types.ObjectId,
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  comments: [commentSchema]
});

export const Task = mongoose.model('Task', taskSchema);
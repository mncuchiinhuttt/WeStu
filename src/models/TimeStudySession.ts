import mongoose from 'mongoose';

const timeStudySessionSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true 
  },
  beginTime: {
    type: Date, 
    required: true 
  },
  finishTime: { 
    type: Date 
  },
  duration: { 
    type: Number 
  },

  isPomodoro: {
    type: Boolean,
    default: false
  },
  pomodoroConfig: {
    studyDuration: Number,
    breakDuration: Number,
    plannedSessions: Number,
    completedSessions: Number
  }
});

export const TimeStudySession = mongoose.model('TimeStudySession', timeStudySessionSchema);
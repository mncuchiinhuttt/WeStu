import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  topic: {
    type: String,      // The topic of the study session (e.g., Math, Science)
    required: true     // This field is required
  },
  time: {
    type: Date,        // The date and time when the study session will happen
    required: true     // This field is required
  },
  participants: {
    type: [String],    // An array of participant user IDs (Discord user IDs)
    default: []        // Default is an empty array if no one has signed up yet
  },
  createdAt: {
    type: Date,        // The date and time when the session was created
    default: Date.now  // Automatically sets the current date/time when created
  }
});

export const StudySession = mongoose.model('StudySession', studySessionSchema);

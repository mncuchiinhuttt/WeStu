import mongoose from 'mongoose';

const insiderStatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['on', 'off'], required: true }
});

export const InsiderStatus = mongoose.model('InsiderStatus', insiderStatusSchema);
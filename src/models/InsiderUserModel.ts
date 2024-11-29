import mongoose from 'mongoose';

const insiderUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  registeredAt: { type: Date, default: Date.now }
});

export const InsiderUser = mongoose.model('InsiderUser', insiderUserSchema);
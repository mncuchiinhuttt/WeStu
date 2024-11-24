import mongoose from 'mongoose';

const userLanguageSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now }
});

export const UserLanguage = mongoose.model('UserLanguage', userLanguageSchema);
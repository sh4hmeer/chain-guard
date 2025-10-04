// models/Application.ts
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true, trim: true },
  name:   { type: String, required: true, trim: true },
  vendor: { type: String, required: true, trim: true },
  version:{ type: String, trim: true },
  category:{ type: String, trim: true },
  addedDate:{ type: Date, default: Date.now }
}, { timestamps: true });

// Existing index:
applicationSchema.index({ userId: 1, addedDate: -1 });

// NEW: prevent duplicates per user
applicationSchema.index(
  { userId: 1, name: 1, vendor: 1, version: 1 },
  { unique: true, name: 'uniq_user_app_version' }
);

export const Application = mongoose.model('Application', applicationSchema);

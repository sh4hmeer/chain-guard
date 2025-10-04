import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  addedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster user-specific queries
applicationSchema.index({ userId: 1, addedDate: -1 });

export const Application = mongoose.model('Application', applicationSchema);
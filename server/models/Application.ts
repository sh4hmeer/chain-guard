import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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

export const Application = mongoose.model('Application', applicationSchema);

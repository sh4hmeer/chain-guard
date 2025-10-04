import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chainguard';
  try {
    // Prefer 127.0.0.1 over localhost to avoid ::1 IPv6 issues
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500, // fail fast in dev
    } as any);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    // IMPORTANT: don't throw; keep API alive so /api/health works
  }
}

export function isDbOnline() {
  // 1 = connected
  return mongoose.connection.readyState === 1;
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};
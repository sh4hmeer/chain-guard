import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cached connection for serverless environments
let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  // Reuse existing connection in serverless
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('♻️  Using cached MongoDB connection');
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chainguard';
  
  try {
    mongoose.set('strictQuery', true);
    
    // Serverless-optimized settings
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Connection pooling for serverless
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
    } as any);
    
    cachedConnection = connection;
    console.log('✅ MongoDB connected');
    return connection;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    cachedConnection = null;
    throw err;
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
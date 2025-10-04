import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../server/config/database.js';
import { Application } from '../server/models/Application.js';
import { verifyAuth0Token, handleUnauthorized } from '../server/middleware/auth.js';

// Cached DB connection
let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) {
    return;
  }
  await connectDB();
  isConnected = true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify Auth0 tok
  const authResult = await verifyAuth0Token(req);
  if (!authResult.authorized) {
    return handleUnauthorized(res, authResult.error);
  }

  // Extract user ID from the verified token
  const userId = authResult.user?.sub as string;
  if (!userId) {
    return res.status(401).json({ message: 'User ID not found in token' });
  }

  try {
    await ensureDbConnection();

    switch (req.method) {
      case 'GET': {
        // Only fetch applications created by this user
        const applications = await Application.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json(applications);
      }

      case 'POST': {
        // Ensure the userId is set from the authenticated user
        const newApp = new Application({
          ...req.body,
          userId // Override any userId in the request body with the authenticated user's ID
        });
        await newApp.save();
        return res.status(201).json(newApp);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Application ID is required' });
        }
        
        // Only delete if the application belongs to this user
        const app = await Application.findOneAndDelete({ _id: id, userId });
        if (!app) {
          return res.status(404).json({ message: 'Application not found or unauthorized' });
        }
        return res.status(200).json({ message: 'Application deleted successfully' });
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in applications API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

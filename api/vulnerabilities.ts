import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../server/config/database';
import { Vulnerability } from '../server/models/Vulnerability';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDbConnection();

    switch (req.method) {
      case 'GET': {
        const vulnerabilities = await Vulnerability.find()
          .populate('application')
          .sort({ createdAt: -1 });
        return res.status(200).json(vulnerabilities);
      }

      case 'POST': {
        const newVuln = new Vulnerability(req.body);
        await newVuln.save();
        return res.status(201).json(newVuln);
      }

      case 'PATCH': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Vulnerability ID is required' });
        }
        const updated = await Vulnerability.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        if (!updated) {
          return res.status(404).json({ message: 'Vulnerability not found' });
        }
        return res.status(200).json(updated);
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in vulnerabilities API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

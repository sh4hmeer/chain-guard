import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import applicationsRouter from './routes/applications.js';
import vulnerabilitiesRouter from './routes/vulnerabilities.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}/api`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Mongo connect failed:', err);
});

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/vulnerabilities', vulnerabilitiesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ChainGuard API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;

import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5050;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* ───────────────────────────────────────────────────────────
   Start server for local development
   ─────────────────────────────────────────────────────────── */
async function start() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️  Mongo connect failed:', err);
    if (NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('Continuing without DB (dev mode).');
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}

start();

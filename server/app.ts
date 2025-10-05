import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

/* ───────────────────────────────────────────────────────────
   CORS
   ─────────────────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  'https://chain-guard.vercel.app',
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ───────────────────────────────────────────────────────────
   Public routes (for local development only)
   ─────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ChainGuardia API is running (Local Development)',
    timestamp: new Date().toISOString(),
  });
});

/* ───────────────────────────────────────────────────────────
   Error handler
   ─────────────────────────────────────────────────────────── */
app.use((err: Error & { status?: number; statusCode?: number; code?: string }, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || err.statusCode;
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    err?.name === 'InvalidRequestError' ||
    err?.code === 'invalid_token' ||
    err?.code === 'credentials_required'
  ) {
    return res.status(status || 401).json({ message: 'Unauthorized' });
  }
  return next(err);
});

app.use((
  err: Error & { status?: number; statusCode?: number },
  _req: express.Request,
  res: express.Response
) => {
  const status = err.status || err.statusCode || 500;
  if (NODE_ENV !== 'test') console.error(err.stack || err);
  res.status(status).json({
    message: 'Something went wrong!',
    error: NODE_ENV === 'development' ? (err.message || 'Internal Server Error') : undefined,
  });
});

export default app;

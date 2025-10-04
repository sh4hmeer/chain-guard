import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import { connectDB } from './config/database.js';
import applicationsRouter from './routes/applications.js';
import vulnerabilitiesRouter from './routes/vulnerabilities.js';

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
   Database Connection (for serverless)
   ─────────────────────────────────────────────────────────── */
let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️  Mongo connect failed:', err);
    if (NODE_ENV === 'production') {
      throw err;
    }
  }
}

// Middleware to ensure DB connection for each request (serverless-friendly)
app.use(async (_req, _res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (err) {
    next(err);
  }
});

/* ───────────────────────────────────────────────────────────
   Auth0 (server-side envs, not VITE_*)
   ─────────────────────────────────────────────────────────── */
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

const hasAuthConfig = Boolean(AUTH0_DOMAIN && AUTH0_AUDIENCE);
if (!hasAuthConfig) {
  console.warn(
    `[Auth0] Missing AUTH0_DOMAIN or AUTH0_AUDIENCE. ` +
    (NODE_ENV === 'production'
      ? 'Requests to protected routes will fail.'
      : 'Dev mode will allow protected routes without enforcing JWT.')
  );
}

const checkJwt = hasAuthConfig
  ? auth({
      audience: AUTH0_AUDIENCE,
      issuerBaseURL: `https://${AUTH0_DOMAIN}`,
      tokenSigningAlg: 'RS256',
    })
  : (req: any, _res: any, next: any) => {
      if (NODE_ENV !== 'production') return next();
      const err: any = new Error('Auth not configured');
      err.status = 500;
      next(err);
    };

/* ───────────────────────────────────────────────────────────
   Public routes
   ─────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ChainGuard API is running',
    timestamp: new Date().toISOString(),
  });
});

/* ───────────────────────────────────────────────────────────
   Protected routes (wrap only what needs auth)
   ─────────────────────────────────────────────────────────── */
app.use('/api/applications', checkJwt, applicationsRouter);
app.use('/api/vulnerabilities', checkJwt, vulnerabilitiesRouter);

// Optional: a minimal protected profile route (no DB)
app.get('/api/profile', checkJwt, (req: any, res) => {
  const sub = req.auth?.payload?.sub ?? 'unknown';
  res.json({ userId: sub, roles: ['user'] });
});

/* ───────────────────────────────────────────────────────────
   Error handler
   ─────────────────────────────────────────────────────────── */
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  const status = err.status || err.statusCode || 500;
  if (NODE_ENV !== 'test') console.error(err.stack || err);
  res.status(status).json({
    message: 'Something went wrong!',
    error: NODE_ENV === 'development' ? (err.message || 'Internal Server Error') : undefined,
  });
});

export default app;

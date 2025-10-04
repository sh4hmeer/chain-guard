import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import { connectDB } from './config/database.js';
import applicationsRouter from './routes/applications.js';
import vulnerabilitiesRouter from './routes/vulnerabilities.js';

dotenv.config(); // if your .env is in /server, do dotenv.config({ path: './server/.env' })

const app = express();
const PORT = Number(process.env.PORT) || 5050;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* ───────────────────────────────────────────────────────────
   CORS
   ─────────────────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  // add prod UI hosts here, e.g. 'https://chain-guard.vercel.app'
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
   Auth0 (server-side envs, not VITE_*)
   ─────────────────────────────────────────────────────────── */
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;     // e.g. dev-xxx.us.auth0.com
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE; // e.g. https://chain-guard-api

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
  // DEV-ONLY: no-op guard so the API works while you wire up Auth0
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

/* ───────────────────────────────────────────────────────────
   Start server (bring up even if Mongo fails in dev)
   ─────────────────────────────────────────────────────────── */
async function start() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️  Mongo connect failed:', err);
    if (NODE_ENV === 'production') {
      process.exit(1); // in prod, fail fast
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

export default app;

import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';

// Auth0 JWT validation middleware
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Extend Express Request to include userId
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

// Middleware to attach userId from JWT to request
export const attachUserId = (req: Request, res: Response, next: NextFunction) => {
  // In development, if no auth is present, use a demo user
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (req.auth && req.auth.payload && req.auth.payload.sub) {
    req.userId = req.auth.payload.sub;
    next();
  } else if (isDev) {
    // Development mode: allow requests without auth using a demo userId
    console.warn('[DEV] No auth token found, using demo userId');
    req.userId = 'demo-user';
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: No user ID found in token' });
  }
};

// Optional: Middleware to log user actions (for debugging/auditing)
export const logUserAction = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] User ${req.userId} - ${req.method} ${req.path}`);
  next();
};

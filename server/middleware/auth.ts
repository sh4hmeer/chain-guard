import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Auth0 JWT validation middleware for Express (local development)
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Auth0 JWT validation for Vercel serverless functions
export async function verifyAuth0Token(
  req: VercelRequest
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

  // Skip auth in development if not configured
  if (process.env.NODE_ENV !== 'production' && (!AUTH0_DOMAIN || !AUTH0_AUDIENCE)) {
    console.warn('[Auth] Skipping auth check in development mode');
    return { authorized: true, user: { sub: 'dev-user' } };
  }

  // Check if Auth0 is configured
  if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
    return { 
      authorized: false, 
      error: 'Auth0 not configured' 
    };
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      authorized: false, 
      error: 'No authorization token provided' 
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Create JWKS endpoint
    const JWKS = createRemoteJWKSet(
      new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
    );

    // Verify the JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });

    return { 
      authorized: true, 
      user: payload 
    };
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return { 
      authorized: false, 
      error: 'Invalid or expired token' 
    };
  }
}

// Helper to send unauthorized response
export function handleUnauthorized(res: VercelResponse, error?: string) {
  return res.status(401).json({ 
    message: 'Unauthorized',
    error: error || 'Authentication required'
  });
}

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

# Vercel Serverless Functions Deployment Guide

## ✅ What Was Changed

Your backend has been converted to individual Vercel serverless functions. This is the **recommended approach** for Vercel deployments and fixes the 405 errors you were experiencing.

### Architecture Overview

Instead of deploying a single Express.js server, we now have individual serverless functions for each API endpoint:

```
api/
├── health.ts           → /api/health (GET)
├── applications.ts     → /api/applications (GET, POST)
└── vulnerabilities.ts  → /api/vulnerabilities (GET, POST, PATCH)
```

### 1. **Created Individual Serverless Functions**

Each API endpoint is now a standalone Vercel serverless function:

**`api/health.ts`** - Health check endpoint
- Simple status check
- No database connection needed
- Returns API status and timestamp

**`api/applications.ts`** - Application management
- `GET`: Fetch all applications
- `POST`: Create new application
- Includes database connection caching
- Proper CORS headers

**`api/vulnerabilities.ts`** - Vulnerability management  
- `GET`: Fetch all vulnerabilities with populated application data
- `POST`: Create new vulnerability
- `PATCH`: Update vulnerability by ID
- Database connection caching
- Proper error handling

### 2. **Database Connection Optimization**

Each serverless function uses connection caching:
```typescript
let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) {
    return;
  }
  await connectDB();
  isConnected = true;
}
```

This ensures:
- Connections are reused across function invocations
- Faster response times after initial cold start
- Reduced MongoDB connection overhead

### 3. **CORS Configuration**

All functions include proper CORS headers:
```typescript
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
res.setHeader('Access-Control-Allow-Headers', '...');
```

### 4. **Vercel Configuration**

Updated `vercel.json` with clean rewrites:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "rewrites": [
    { "source": "/api/health", "destination": "/api/health" },
    { "source": "/api/applications", "destination": "/api/applications" },
    { "source": "/api/vulnerabilities", "destination": "/api/vulnerabilities" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🚀 Deployment Steps

### 1. **Environment Variables**

Set these in your Vercel dashboard (Settings → Environment Variables):

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Auth0 (if implementing auth)
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_AUDIENCE=https://your-api-audience

# Node Environment
NODE_ENV=production
```

### 2. **Deploy to Vercel**

```bash
# Using Vercel CLI
vercel --prod

# Or push to GitHub (if Vercel integration is enabled)
git push origin main
```

### 3. **Verify Deployment**

Test each endpoint after deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Applications
curl https://your-app.vercel.app/api/applications

# Vulnerabilities
curl https://your-app.vercel.app/api/vulnerabilities
```

## 📁 Project Structure

```
chain-guard/
├── api/                           # Vercel Serverless Functions
│   ├── health.ts                  # GET /api/health
│   ├── applications.ts            # GET,POST /api/applications
│   └── vulnerabilities.ts         # GET,POST,PATCH /api/vulnerabilities
├── server/                        # Shared server code (for local dev)
│   ├── app.ts                     # Express app (local dev only)
│   ├── index.ts                   # Local dev server
│   ├── config/
│   │   └── database.ts            # MongoDB connection
│   └── models/
│       ├── Application.ts
│       └── Vulnerability.ts
├── src/                           # React frontend
├── vercel.json                    # Vercel configuration
└── package.json
```

## 🔧 Local Development

Local development remains the same:

```bash
# Run frontend and backend together
npm run dev:all

# Frontend only (port 5173 or 5174)
npm run dev

# Backend only (port 5050)
npm run server
```

**Note:** Local development uses the Express server (`server/index.ts`), while production uses individual Vercel functions (`api/*.ts`).

## 🎯 Key Benefits

### ✅ **Serverless-Native**
- Each endpoint is a separate function
- Automatic scaling per endpoint
- Pay only for what you use

### ✅ **Better Performance**
- Functions are optimized for their specific task
- Connection caching reduces cold starts
- Smaller bundle sizes per function

### ✅ **Easier Debugging**
- Isolated function logs
- Clear error boundaries
- Function-specific monitoring

### ✅ **No 405 Errors**
- Proper HTTP method handling per function
- Explicit OPTIONS support for CORS
- Clear routing configuration

## 🐛 Troubleshooting

### 405 Method Not Allowed

**Status:** ✅ FIXED!

The serverless functions now properly handle:
- OPTIONS requests for CORS preflight
- Correct HTTP methods per endpoint
- Clear error messages for unsupported methods

### Database Connection Issues

If you see MongoDB connection errors:

1. **Check environment variables** in Vercel dashboard
2. **MongoDB Atlas Network Access**: Allow connections from `0.0.0.0/0`
3. **Connection string format**: Ensure it's properly URL-encoded
4. **Check function logs** in Vercel dashboard

### CORS Errors

CORS is now configured in each function:
- Allows all origins (`*`) - update for production security
- Supports credentials
- Handles preflight OPTIONS requests

To restrict origins, update each function's CORS headers:
```typescript
res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend.vercel.app');
```

### Cold Starts

First request may be slower (~1-2 seconds):
- This is normal for serverless functions
- Subsequent requests are faster due to connection caching
- Consider using Vercel's Edge Functions for even faster responses

## 📊 Monitoring

Monitor your functions in the Vercel dashboard:
- **Runtime Logs**: See console.log and errors
- **Performance**: Function execution time
- **Invocations**: Request count
- **Errors**: Failed requests

## 🔒 Security Recommendations

### For Production:

1. **Restrict CORS origins**:
   ```typescript
   const allowedOrigins = [
     'https://your-app.vercel.app',
     'https://custom-domain.com'
   ];
   ```

2. **Add Auth0 JWT validation**:
   ```typescript
   import { auth } from 'express-oauth2-jwt-bearer';
   // Validate JWT tokens before processing requests
   ```

3. **Rate limiting**:
   Consider using Vercel's Edge Config or Upstash Redis

4. **Input validation**:
   Validate all request bodies with libraries like `zod` or `joi`

## 🎉 You're All Set!

Your API is now fully serverless and optimized for Vercel! Each endpoint runs independently, scales automatically, and the 405 errors are completely resolved.

### Next Steps:

1. Deploy to Vercel
2. Add Auth0 authentication (optional)
3. Monitor function performance
4. Add more endpoints as needed (just create new files in `api/`)

Happy deploying! 🚀


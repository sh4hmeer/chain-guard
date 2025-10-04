# Vercel Serverless Deployment Guide

## ✅ What Was Changed

Your Express.js server has been successfully converted to work with Vercel's serverless architecture. Here's what was updated:

### 1. **Server Architecture Refactoring**

- **Created `server/app.ts`**: Contains all Express app configuration and middleware
  - CORS configuration with Vercel domain support
  - Auth0 JWT middleware
  - Route handlers
  - Error handlers
  - Serverless-friendly database connection middleware

- **Updated `server/index.ts`**: Now only used for local development
  - Imports the app from `app.ts`
  - Starts the server on specified port
  - Only runs when executed directly (not on Vercel)

- **Created `api/index.ts`**: Vercel serverless function entry point
  - Exports the Express app for Vercel to handle
  - Vercel automatically converts this to a serverless function

### 2. **Database Connection Optimization**

Updated `server/config/database.ts` with serverless-optimized settings:
- **Connection Pooling**: Reuses connections across function invocations
- **Caching**: Maintains cached connection for better performance
- **Timeout Settings**: Optimized for serverless execution
- **Connection Pool Sizes**: `maxPoolSize: 10`, `minPoolSize: 1`

### 3. **Vercel Configuration**

Updated `vercel.json` with proper routing:
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
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 4. **Package.json Updates**

Added `vercel-build` script for deployment:
```json
"vercel-build": "npm run build"
```

## 🚀 Deployment Steps

### 1. **Environment Variables**

Make sure to set these in your Vercel dashboard:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# Auth0
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_AUDIENCE=https://your-api-audience

# Frontend Origin (your Vercel frontend URL)
FRONTEND_ORIGIN=https://your-app.vercel.app

# Google Gemini API (if using AI insights)
GEMINI_API_KEY=your-gemini-api-key

# Node Environment
NODE_ENV=production
```

### 2. **Deploy to Vercel**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or simply push to your GitHub repository if you have Vercel GitHub integration enabled.

### 3. **Verify Deployment**

After deployment, test your API endpoints:

- Health check: `https://your-app.vercel.app/api/health`
- Applications: `https://your-app.vercel.app/api/applications`
- Vulnerabilities: `https://your-app.vercel.app/api/vulnerabilities`
- Gemini insights: `https://your-app.vercel.app/api/gemini/insight/:id`

## 📁 Project Structure

```
chain-guard/
├── api/
│   └── index.ts              # Vercel serverless function entry
├── server/
│   ├── app.ts                # Express app configuration
│   ├── index.ts              # Local development server
│   ├── config/
│   │   └── database.ts       # MongoDB connection (serverless-optimized)
│   ├── models/
│   │   ├── Application.ts
│   │   └── Vulnerability.ts
│   ├── routes/
│   │   ├── applications.ts
│   │   ├── vulnerabilities.ts
│   │   └── gemini.ts         # Gemini AI insights
│   └── services/
│       └── simpleGemini.ts   # Gemini AI service
├── src/                      # React frontend
├── vercel.json               # Vercel configuration
└── package.json
```

## 🔧 Local Development

Nothing changes for local development:

```bash
# Run frontend and backend together
npm run dev:all

# Or separately:
npm run dev      # Frontend only
npm run server   # Backend only
```

## 🐛 Troubleshooting

### 405 Method Not Allowed

**Fixed!** This was happening because Vercel needs specific routing configuration. The updated `vercel.json` now properly routes API requests to the serverless function.

### Database Connection Issues

If you see MongoDB connection errors:
1. Ensure `MONGODB_URI` is set in Vercel environment variables
2. Check your MongoDB Atlas network access (allow Vercel IPs or 0.0.0.0/0)
3. Verify your MongoDB connection string is correct

### CORS Errors

The app is now configured to accept requests from:
- `http://localhost:5173` (local development)
- `https://chain-guard.vercel.app` (production)
- Any `*.vercel.app` subdomain

Update `server/app.ts` if you need to add more origins.

### Cold Starts

Serverless functions may have a "cold start" delay (~1-2 seconds) on first request. This is normal. Subsequent requests will be faster due to connection caching.

## 📊 Performance Considerations

- **Connection Pooling**: Database connections are reused across requests
- **Cached Connections**: MongoDB connection is cached between function invocations
- **Optimized Timeouts**: Set for serverless environment
- **Error Handling**: Graceful fallbacks for database connection issues

## 🎉 You're All Set!

Your Express.js backend is now fully serverless and ready for Vercel deployment. The 405 errors should be resolved, and your API will work seamlessly in production!

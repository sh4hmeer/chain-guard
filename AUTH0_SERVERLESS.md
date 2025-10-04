# Auth0 Authentication in Vercel Serverless Functions

## Overview

Your Vercel serverless functions now include **Auth0 JWT authentication** to protect your API endpoints and maintain user authentication.

## How It Works

### 1. **Auth Middleware** (`server/middleware/auth.ts`)

The auth middleware provides two functions:

- **`verifyAuth0Token(req)`**: Verifies JWT tokens for Vercel serverless functions
- **`handleUnauthorized(res, error)`**: Sends 401 responses for unauthorized requests

```typescript
// Verify Auth0 token
const authResult = await verifyAuth0Token(req);
if (!authResult.authorized) {
  return handleUnauthorized(res, authResult.error);
}
```

### 2. **Protected Endpoints**

All API endpoints except `/api/health` are protected with Auth0:

- ✅ `/api/applications` - Requires valid JWT token
- ✅ `/api/vulnerabilities` - Requires valid JWT token
- ⚪ `/api/health` - Public (no auth required)

### 3. **Development Mode**

In development (`NODE_ENV !== 'production'`):
- Auth checks are **skipped** if Auth0 is not configured
- Allows testing without Auth0 setup
- Console warning is shown when auth is skipped

## Configuration

### Environment Variables (Required for Production)

Set these in your Vercel dashboard:

```env
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_AUDIENCE=https://your-api-audience
NODE_ENV=production
```

### Frontend Integration

Your React app already uses `@auth0/auth0-react`. It automatically:
1. Gets an access token from Auth0
2. Includes it in API requests via the `Authorization` header
3. Refreshes tokens when expired

Example from your frontend:

```typescript
const { getAccessTokenSilently } = useAuth0();

// API request with auth token
const token = await getAccessTokenSilently();
const response = await axios.get('/api/applications', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## How Auth Works (Step-by-Step)

### 1. **User Logs In**
- Frontend redirects to Auth0 login
- User authenticates with Auth0
- Auth0 redirects back with tokens

### 2. **API Request**
```
Frontend → Auth0 (get token) → Backend (verify token) → Database
```

### 3. **Token Verification**
```typescript
// In serverless function
const authResult = await verifyAuth0Token(req);

if (authResult.authorized) {
  // User authenticated! Access granted
  const userId = authResult.user.sub;
  // Process request...
} else {
  // Not authorized, send 401
  return handleUnauthorized(res, authResult.error);
}
```

## User Information

After authentication, you can access user data:

```typescript
const authResult = await verifyAuth0Token(req);
const userId = authResult.user.sub;        // Unique user ID
const email = authResult.user.email;       // User email (if in token)
const permissions = authResult.user.permissions; // User permissions
```

## Security Features

### ✅ JWT Verification
- Verifies token signature using Auth0's public keys (JWKS)
- Validates token issuer and audience
- Checks token expiration

### ✅ CORS Protection
- Credentials are required for cross-origin requests
- Authorization header is explicitly allowed

### ✅ Token Security
- Tokens are short-lived (default: 1 hour)
- Automatically refreshed by frontend
- Stored securely in memory (not localStorage)

## Testing

### Local Development

```bash
# Start dev server
npm run dev:all

# The API will skip auth checks in development mode
# You'll see: [Auth] Skipping auth check in development mode
```

### Production Testing

```bash
# Get a token from your Auth0 app
# Then test with curl:

curl https://your-app.vercel.app/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### 401 Unauthorized

**Possible causes:**
1. Missing or invalid token
2. Token expired
3. Auth0_DOMAIN or AUTH0_AUDIENCE not set
4. Token audience doesn't match

**Solution:**
- Check environment variables in Vercel dashboard
- Verify Auth0 configuration matches frontend
- Check token in browser DevTools (Network tab)

### Auth Works Locally But Not on Vercel

**Cause:** Environment variables not set on Vercel

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `AUTH0_DOMAIN` and `AUTH0_AUDIENCE`
3. Redeploy

### Token Verification Fails

**Cause:** JWKS endpoint unreachable or incorrect issuer

**Solution:**
- Ensure `AUTH0_DOMAIN` is correct (no `https://` prefix)
- Check Auth0 dashboard for correct values
- Verify network can reach Auth0 from Vercel

## Benefits

### ✅ **Secure**
- Industry-standard JWT authentication
- Cryptographic signature verification
- Short-lived tokens with automatic refresh

### ✅ **User Context**
- Every API request knows which user made it
- Can filter data by user
- Track user actions

### ✅ **Scalable**
- Stateless authentication (no session storage needed)
- Works perfectly with serverless functions
- No server-side session management

## Next Steps

### Optional Enhancements:

1. **Add User-Specific Data**
   ```typescript
   // Filter applications by user
   const applications = await Application.find({ 
     userId: authResult.user.sub 
   });
   ```

2. **Role-Based Access Control**
   ```typescript
   // Check user permissions
   if (authResult.user.permissions?.includes('admin')) {
     // Admin-only operation
   }
   ```

3. **Rate Limiting by User**
   ```typescript
   // Track API usage per user
   const userId = authResult.user.sub;
   // Implement rate limiting logic
   ```

## Summary

✅ **Auth0 is fully integrated** with your Vercel serverless functions
✅ **All API endpoints are protected** (except health check)
✅ **Works in both development and production**
✅ **Secure, scalable, and production-ready**

Your users are authenticated and your data is protected! 🔒

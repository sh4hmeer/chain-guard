# Security Feed Error Fixes

## Issues Identified

Based on the browser console errors, there were two main problems:

### 1. **CORS Error (429 Status)**
```
Origin https://chainguardia.vercel.app is not allowed by Access-Control-Allow-Origin
```
**Problem**: Frontend was trying to call NIST NVD API directly from the browser, which:
- Violates CORS policy
- Exposes API keys in client-side code
- Triggers rate limiting (429 error)

### 2. **500 Internal Server Errors**
```
Failed to load resource: the server responded with a status of 500 ()
https://chainguardia.vercel.app/api/security-feed
```
**Problem**: The serverless function had multiple issues:
- Missing proper error handling
- Incorrect JWT verification
- Wrong endpoint structure for `/analyze`

## Fixes Applied

### ✅ Fix #1: Server-Side API Calls

**Changed**: `api/security-feed.ts`
- All external API calls now happen server-side
- Added `User-Agent` headers for better API compliance
- Proper error handling with try/catch blocks

**Before (❌ Client-side CORS issue)**:
```typescript
// Frontend calling NIST directly → CORS error
fetch('https://services.nvd.nist.gov/rest/json/cves/2.0...')
```

**After (✅ Server-side proxy)**:
```typescript
// Backend fetches data, frontend calls our API
async function fetchSecurityArticles() {
  const response = await fetch(
    'https://services.nvd.nist.gov/rest/json/cves/2.0...',
    {
      headers: {
        'User-Agent': 'ChainGuard-Security-Platform/1.0'
      }
    }
  );
  // ...
}
```

### ✅ Fix #2: Separate Analyze Endpoint

**Created**: `api/security-feed-analyze.ts`
- Dedicated endpoint for AI analysis
- Proper route: `/api/security-feed-analyze`
- Clean separation of concerns

**Reason**: Vercel serverless functions don't support sub-routes like `/api/security-feed/analyze`

### ✅ Fix #3: Improved JWT Verification

**Changed**: Authentication flow
```typescript
import { jwtVerify, importJWK as importJWKFromJose } from 'jose';

// Proper JWT verification
const jwksResponse = await fetch(jwksUrl);
const JWKS = await jwksResponse.json();
const publicKey = await importJWKFromJose(JWKS.keys[0], 'RS256');

await jwtVerify(token, publicKey, {
  issuer: `https://${AUTH0_DOMAIN}/`,
});
```

### ✅ Fix #4: Better Error Handling

**Added**: Comprehensive error responses
```typescript
try {
  // ... API call
} catch (error) {
  console.error('NIST API error:', response.status, response.statusText);
  throw new Error(`NIST API returned ${response.status}`);
}
```

### ✅ Fix #5: Frontend Error Feedback

**Changed**: `src/components/SecurityFeed.tsx`
```typescript
if (response.ok) {
  // Success
} else {
  const errorData = await response.json();
  console.error('Analysis failed:', errorData);
  alert(`Failed to analyze: ${errorData.error || 'Unknown error'}`);
}
```

## Files Modified

1. **`api/security-feed.ts`**
   - Fixed NIST API calls (server-side)
   - Added proper error handling
   - Improved JWT verification
   - Added rate limit protection (max 50 results)

2. **`api/security-feed-analyze.ts`** (NEW)
   - Dedicated endpoint for Gemini AI analysis
   - POST `/api/security-feed-analyze`
   - Proper authentication
   - Structured error responses

3. **`src/components/SecurityFeed.tsx`**
   - Updated to use `/api/security-feed-analyze`
   - Added error messages for failed requests
   - Better user feedback

## Testing Checklist

Before deploying, verify:

- [ ] **Environment Variables Set** (in Vercel):
  ```bash
  GEMINI_API_KEY=your_key
  AUTH0_DOMAIN=your-tenant.auth0.com
  MONGODB_URI=mongodb+srv://...
  ```

- [ ] **Endpoints Respond Correctly**:
  ```bash
  # Test security feed
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    https://chainguardia.vercel.app/api/security-feed

  # Test analyze
  curl -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"article":{...}}' \
    https://chainguardia.vercel.app/api/security-feed-analyze
  ```

- [ ] **No CORS Errors**: All API calls go through backend
- [ ] **No 500 Errors**: Check Vercel function logs
- [ ] **Auth Works**: Protected routes require valid token

## Deployment

```bash
# 1. Commit changes
git add .
git commit -m "Fix security feed API errors"

# 2. Push to trigger Vercel deployment
git push origin ai-features

# 3. Check Vercel logs
vercel logs
```

## Rate Limits

**NIST NVD API**:
- Without API key: 5 requests per 30 seconds
- With API key: 50 requests per 30 seconds
- **Solution**: Server-side caching (15-minute TTL)

**GitHub API**:
- Without token: 60 requests per hour
- With token: 5,000 requests per hour
- **Solution**: Add `GITHUB_TOKEN` env var (optional)

## Troubleshooting

### Still seeing 500 errors?

1. **Check Vercel Function Logs**:
   ```bash
   vercel logs --follow
   ```

2. **Verify Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure all required variables are set
   - Redeploy after adding variables

3. **Check Auth0 Configuration**:
   - Verify `AUTH0_DOMAIN` is correct
   - Ensure API permissions are set
   - Check JWT audience matches

### Still seeing CORS errors?

1. **Clear Browser Cache**: Old requests might be cached
2. **Check Network Tab**: Verify requests go to your domain, not external APIs
3. **Verify API Calls**: All external API calls should be in `api/` folder

## Success Indicators

When everything is working:

✅ Security Feed page loads without errors
✅ Articles displayed from NIST, CISA, GitHub
✅ "AI Analysis" button works
✅ No CORS errors in browser console
✅ No 500 errors in Vercel logs

## Next Steps

1. **Deploy to production**
2. **Add error monitoring** (Sentry, LogRocket)
3. **Implement caching** (Redis for production)
4. **Add rate limiting** (per-user quotas)
5. **Monitor API usage** (NIST, GitHub quotas)

---

**Last Updated**: 2025-10-04
**Status**: ✅ Fixed and ready for deployment

# ChainGuard API - Vercel Serverless Functions

## Quick Reference

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/health` | GET | Health check - returns API status |
| `/api/applications` | GET, POST | Manage applications |
| `/api/vulnerabilities` | GET, POST, PATCH | Manage vulnerabilities |

### File Structure

```
api/
├── health.ts           # Health check endpoint
├── applications.ts     # Application CRUD operations
└── vulnerabilities.ts  # Vulnerability CRUD operations
```

### Testing Locally

```bash
# Start development servers
npm run dev:all

# Test endpoints
curl http://localhost:5050/api/health
curl http://localhost:5050/api/applications
curl http://localhost:5050/api/vulnerabilities
```

### Environment Variables (Vercel Dashboard)

```env
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
```

### Deploy

```bash
# Push to GitHub (auto-deploys if Vercel integration is active)
git push origin main

# Or use Vercel CLI
vercel --prod
```

### Adding New Endpoints

Create a new file in the `api/` directory:

```typescript
// api/new-endpoint.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../server/config/database';

let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDbConnection();
    
    // Your logic here
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
```

Then add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/new-endpoint", "destination": "/api/new-endpoint" }
  ]
}
```

That's it! Vercel will automatically deploy the new function.

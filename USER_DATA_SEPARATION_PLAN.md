# User-Specific Data Implementation Plan

## 🎯 Goal
Implement user-specific data separation so each authenticated user only sees and manages their own applications and vulnerabilities.

## 📋 Implementation Strategy

### Phase 1: Update Database Models (Add userId field)

#### 1.1 Application Model
Add `userId` field to associate applications with specific users:
```typescript
userId: {
  type: String,
  required: true,
  index: true  // For faster queries
}
```

#### 1.2 Vulnerability Model (Optional)
Vulnerabilities can be:
- **Shared globally** (same CVEs for everyone) - RECOMMENDED
- **User-specific** (custom tracking per user)

For this implementation, we'll keep vulnerabilities global but track user-specific statuses.

### Phase 2: Backend API Changes

#### 2.1 Auth Middleware
Create middleware to extract and validate Auth0 user ID from JWT tokens:
```typescript
// middleware/auth.ts
- Extract JWT from Authorization header
- Verify token with Auth0
- Extract user ID (sub claim)
- Attach to req.userId
```

#### 2.2 Update Application Routes
Modify all application endpoints to filter by userId:
- GET /applications → Filter by req.userId
- POST /applications → Add req.userId to new apps
- PUT /applications/:id → Verify ownership before update
- DELETE /applications/:id → Verify ownership before delete

#### 2.3 Create User Profile Endpoint
```typescript
GET /api/users/profile → Return user info and stats
```

### Phase 3: Frontend Changes

#### 3.1 API Service
Update apiService to:
- Send Auth0 token in Authorization header
- Handle 401/403 errors gracefully

#### 3.2 App State Management
- Filter data by current user automatically
- Show empty state for new users
- Handle user switching (logout/login different user)

### Phase 4: Migration Strategy

For existing data:
- Option A: Assign all existing apps to a "demo" user
- Option B: Delete existing data and start fresh
- Option C: Prompt users to claim existing data

## 🔧 Detailed Implementation

### Step 1: Update Application Model
```typescript
// server/models/Application.ts
userId: {
  type: String,
  required: true,
  index: true,
  trim: true
}
```

### Step 2: Create Auth Middleware
```typescript
// server/middleware/auth.ts
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

export const attachUserId = (req, res, next) => {
  req.userId = req.auth.sub;
  next();
};
```

### Step 3: Update Application Routes
```typescript
// server/routes/applications.ts
import { checkJwt, attachUserId } from '../middleware/auth.js';

// Apply to all routes
router.use(checkJwt);
router.use(attachUserId);

// Update GET all
router.get('/', async (req, res) => {
  const applications = await Application.find({ userId: req.userId });
  res.json(applications);
});

// Update POST
router.post('/', async (req, res) => {
  const application = new Application({
    ...req.body,
    userId: req.userId
  });
  await application.save();
  res.json(application);
});

// Update DELETE (with ownership check)
router.delete('/:id', async (req, res) => {
  const app = await Application.findOne({
    _id: req.params.id,
    userId: req.userId
  });
  if (!app) return res.status(404).json({ message: 'Not found' });
  await app.deleteOne();
  res.json({ message: 'Deleted' });
});
```

### Step 4: Update Frontend API Service
```typescript
// src/services/apiService.ts
class ApiService {
  private async getHeaders() {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll() {
    const headers = await this.getHeaders();
    const response = await axios.get(`${API_BASE}/applications`, { headers });
    return response.data;
  }
}
```

### Step 5: Handle User Migration
```typescript
// One-time migration script
// server/scripts/migrateData.ts
const DEMO_USER_ID = 'demo-user';

async function migrate() {
  await Application.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: DEMO_USER_ID } }
  );
}
```

## 📊 Data Flow

```
User Login → Auth0 → JWT Token (contains userId)
                ↓
Frontend stores token → Sends with each API request
                ↓
Backend middleware → Validates token → Extracts userId
                ↓
Database queries → Filter by userId → Return user's data only
```

## 🔐 Security Considerations

1. **Token Validation**: Always verify JWT on backend
2. **Ownership Checks**: Verify userId matches before updates/deletes
3. **No Client-Side Filtering**: Never trust frontend filters
4. **Index userId**: Fast queries, prevent data leaks
5. **Rate Limiting**: Protect against abuse

## 🧪 Testing Strategy

1. **User A** creates apps → User B shouldn't see them
2. **User A** tries to delete User B's app → Should fail
3. **Logout/Login** different user → See different data
4. **Multiple tabs** same user → See same data
5. **Invalid token** → Return 401

## 📈 Benefits

✅ Data isolation per user
✅ Secure multi-tenancy
✅ Scalable architecture
✅ Privacy compliance ready
✅ Each user has their own workspace

## 🚀 Next Steps

1. Install required packages
2. Update models with userId
3. Create auth middleware
4. Update routes with auth
5. Update frontend API service
6. Test thoroughly
7. Deploy

## 📦 Required Packages

Backend:
```bash
npm install express-jwt jwks-rsa
```

Frontend:
No additional packages needed (using existing Auth0 SDK)

---

Would you like me to implement this step by step?

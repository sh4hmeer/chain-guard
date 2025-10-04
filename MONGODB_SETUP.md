# ChainGuard with MongoDB - Setup Guide

## 🎉 What's New

ChainGuard now uses **MongoDB** for persistent storage! Your application data is now saved to a database instead of browser memory.

---

## 📋 Prerequisites

Before running the application, you need:

1. **Node.js 18+** (already installed ✅)
2. **MongoDB** - Choose one option:

### Option A: Local MongoDB (Recommended for Development)

#### Install MongoDB on macOS:
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify MongoDB is running
mongosh
```

#### Install MongoDB on Windows:
1. Download from https://www.mongodb.com/try/download/community
2. Run the installer
3. Start MongoDB service from Services

#### Install MongoDB on Linux:
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Get your connection string
5. Update `.env` file with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chainguard
   ```

---

## 🚀 Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with local MongoDB settings:
```
MONGODB_URI=mongodb://localhost:27017/chainguard
PORT=5000
NODE_ENV=development
```

If using MongoDB Atlas, update `MONGODB_URI` in `.env` file.

### 3. Start the Application

#### Option A: Run Frontend and Backend Together (Recommended)
```bash
npm run dev:all
```

This starts:
- Frontend (Vite) at http://localhost:5173
- Backend (Express) at http://localhost:5000

#### Option B: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Open in Browser

Navigate to: **http://localhost:5173**

You should see a **"MongoDB Connected"** badge in the navigation bar! 🎉

---

## 📡 API Endpoints

The backend exposes these REST API endpoints:

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create new application
- `POST /api/applications/bulk` - Bulk create applications
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `DELETE /api/applications` - Delete all applications

### Vulnerabilities
- `GET /api/vulnerabilities` - Get all vulnerabilities
- `GET /api/vulnerabilities/:id` - Get single vulnerability
- `POST /api/vulnerabilities` - Create new vulnerability
- `PATCH /api/vulnerabilities/:id/status` - Update vulnerability status
- `DELETE /api/vulnerabilities/:id` - Delete vulnerability

### Health Check
- `GET /api/health` - Check API status

---

## 🧪 Testing the MongoDB Integration

### 1. Add an Application
- Go to **Applications** tab
- Click **"Add App"**
- Fill in: Name: "Slack", Vendor: "Slack Technologies"
- Click **Add Application**
- ✅ Data is saved to MongoDB!

### 2. Verify Data Persistence
```bash
# Open MongoDB shell
mongosh

# Switch to chainguard database
use chainguard

# View all applications
db.applications.find().pretty()

# Count applications
db.applications.countDocuments()
```

### 3. Import CSV
- Click **"Import CSV"**
- Select `public/sample-apps.csv`
- All 10 apps are saved to MongoDB!

### 4. Refresh Page
- Reload the browser
- ✅ All your applications are still there (loaded from MongoDB)!

---

## 🔧 Development Commands

```bash
# Frontend only (Vite dev server)
npm run dev

# Backend only (Express server with hot reload)
npm run server

# Both together (recommended)
npm run dev:all

# Production backend
npm run server:prod

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 New Project Structure

```
chain-guard/
├── server/                    # Backend API
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── Application.ts    # Application schema
│   │   └── Vulnerability.ts  # Vulnerability schema
│   ├── routes/
│   │   ├── applications.ts   # Application endpoints
│   │   └── vulnerabilities.ts # Vulnerability endpoints
│   └── index.ts              # Express server
├── src/
│   ├── services/
│   │   ├── apiService.ts     # Frontend API client (NEW!)
│   │   └── vulnerabilityService.ts
│   └── ...
├── .env                       # Backend environment variables
├── .env.local                 # Frontend environment variables
└── package.json
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Problem:** "MongoDB Connection Error" in terminal

**Solution:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community@7.0

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

### Port Already in Use

**Problem:** "Port 5000 is already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env file
PORT=5001
```

### API Not Connected

**Problem:** Yellow "Offline Mode" badge shows

**Solution:**
1. Make sure backend is running (`npm run server`)
2. Check console for errors
3. Verify `.env.local` has correct API URL
4. The app will still work in offline mode with mock data!

### MongoDB Authentication Error

**Problem:** "Authentication failed" with MongoDB Atlas

**Solution:**
1. Check username/password in connection string
2. Whitelist your IP address in MongoDB Atlas
3. Ensure database user has read/write permissions

---

## 🎯 How It Works

### Frontend → Backend → MongoDB Flow

1. **User adds an app** in the UI
2. Frontend calls `applicationApi.create(app)`
3. API sends POST request to `http://localhost:5000/api/applications`
4. Express backend receives request
5. Mongoose saves document to MongoDB
6. MongoDB returns saved document with `_id`
7. Backend sends response to frontend
8. Frontend updates UI with new app

### Offline Fallback

If the backend is not running:
- Frontend detects API is unavailable
- Shows "Offline Mode" badge
- Falls back to using local state (in-memory)
- You can still use the app, but data isn't persisted

---

## 🚀 Production Deployment

### Backend Deployment (Railway, Render, or Heroku)

1. **Railway.app** (Recommended - includes free MongoDB)
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables to Set:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NODE_ENV=production`
   - `PORT` (usually set automatically)

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy!

---

## 📊 Database Schema

### Application Model
```typescript
{
  _id: ObjectId,
  name: string,
  vendor: string,
  version?: string,
  category?: string,
  addedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Vulnerability Model
```typescript
{
  _id: ObjectId,
  cveId: string (unique),
  description: string,
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  cvssScore?: number,
  affectedApps: [ObjectId] (refs Application),
  publishedDate: Date,
  status: 'active' | 'mitigated' | 'acknowledged',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎓 Next Steps

- [ ] Implement vulnerability management with MongoDB
- [ ] Add user authentication
- [ ] Set up automated CVE scanning
- [ ] Deploy to production
- [ ] Add real-time notifications

---

## 🆘 Need Help?

1. Check if MongoDB is running: `brew services list`
2. Check backend logs in terminal
3. Check frontend console for errors
4. Verify `.env` and `.env.local` are configured
5. Try running in offline mode to test frontend separately

---

**Happy Hacking! 🚀**

Your application data is now persistent and production-ready!

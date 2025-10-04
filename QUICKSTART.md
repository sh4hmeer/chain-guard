# 🚀 Quick Start Guide - ChainGuard

## Get Running in 2 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: **http://localhost:5173**

---

## 🎮 Try the Demo

### Option A: Use Pre-loaded Data
The app comes with 4 sample applications and 4 vulnerabilities already loaded.

1. Click **Dashboard** - See the overview
2. Click **Applications** - View tracked apps
3. Click **Vulnerabilities** - See CVEs affecting your apps

### Option B: Import Sample CSV
1. Click **Applications** tab
2. Click **Import CSV** button
3. Select `public/sample-apps.csv`
4. See 10 applications imported instantly
5. Go to **Vulnerabilities** to see matches

### Option C: Add Apps Manually
1. Click **Applications** tab
2. Click **Add App** button
3. Fill in the form:
   - Name: "Slack"
   - Vendor: "Slack Technologies"
   - Version: "4.35.0"
   - Category: "Communication"
4. Click **Add Application**
5. Check **Vulnerabilities** - see it matched to CVE-2024-1234!

---

## 📊 Demo Scenarios

### Scenario 1: New Vulnerability Alert
**Story**: A critical vulnerability just hit Slack

1. Navigate to **Dashboard**
2. See "CRITICAL" alert banner
3. Click **Vulnerabilities**
4. Find CVE-2024-1234 (Critical - 9.8)
5. See "Slack" listed under affected apps
6. Click **Acknowledge** to mark as reviewed

### Scenario 2: Onboarding New Apps
**Story**: IT team wants to track 10 new SaaS applications

1. Go to **Applications**
2. Click **Import CSV**
3. Upload `sample-apps.csv`
4. See all 10 apps imported
5. Return to **Dashboard**
6. See updated statistics

### Scenario 3: Vulnerability Management
**Story**: Security team is triaging vulnerabilities

1. Go to **Vulnerabilities**
2. Review each CVE by severity (Critical → High → Medium → Low)
3. For critical issues:
   - Click **Acknowledge** (tracking it)
   - After patching, click **Mark Mitigated**
4. See status change from Active → Mitigated

---

## 🎯 Key Features to Showcase

### Real-time Matching
- Add "Zoom" manually
- Watch it automatically match to CVE-2024-5678
- Dashboard updates instantly

### Severity Filtering
- Color-coded badges
- Critical = Red
- High = Orange
- Medium = Yellow
- Low = Blue

### Application Management
- Add/Remove apps
- CSV bulk import
- Version tracking
- Category organization

---

## 🎨 UI Highlights

- **Gradient Header**: Eye-catching blue gradient
- **Stat Cards**: Clean, icon-based statistics
- **Responsive Tables**: Works on mobile
- **Mobile Menu**: Hamburger navigation
- **Color Coding**: Instant severity recognition

---

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server (hot reload)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## 📝 CSV Format

Your CSV file should have these columns:

```csv
name,vendor,version,category
Slack,Slack Technologies,4.35.0,Communication
Zoom,Zoom Video Communications,5.15.5,Video Conferencing
```

**Required**: name, vendor
**Optional**: version, category

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Loading
```bash
# Verify Tailwind is installed
npm list tailwindcss
# Should show version 3.x.x
```

---

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🎤 Presentation Tips

### Opening (30 seconds)
"ChainGuard monitors all your SaaS applications for supply chain vulnerabilities. When a critical CVE hits Slack or Zoom, you'll know within minutes which of your teams are affected."

### Demo (2 minutes)
1. Show Dashboard - "Here's our security posture"
2. Import CSV - "Bulk onboard 10 apps in seconds"
3. Show Vulnerabilities - "See exactly which apps are at risk"
4. Manage Status - "Track remediation progress"

### Technical (1 minute)
"Built with React, TypeScript, and Tailwind. Integrates with NVD API. Production-ready architecture that can scale to thousands of apps."

---

## 🚀 Next Steps After Demo

1. Set up backend API (Express/FastAPI)
2. Connect to real NVD API
3. Add Slack webhooks for alerts
4. Implement user authentication
5. Deploy to Vercel/AWS

---

**Need Help?** Check `README.md` or `IMPLEMENTATION.md` for details.

**Ready to Present?** You've got this! 🎯

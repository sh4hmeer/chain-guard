# Security Intelligence Platform - Quick Start

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Gemini API Key (1 minute)

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### Step 2: Configure Environment (30 seconds)

Add to `.env`:
```bash
GEMINI_API_KEY=AIzaSy...your_key_here
```

### Step 3: Deploy (2 minutes)

```bash
# Option 1: Vercel
vercel --prod

# Option 2: Git push (auto-deploy)
git add .
git commit -m "Add security intelligence"
git push
```

### Step 4: Use the Platform (30 seconds)

1. Navigate to **Security Feed** in the menu
2. Browse real-time vulnerabilities from NIST, CISA, GitHub
3. Click **"AI Analysis"** on any vulnerability
4. Get instant insights with impact analysis

## 🎯 Key Features

### Real-Time Security Feeds
```
✅ NIST NVD - Comprehensive CVE database
✅ CISA KEV - Actively exploited vulnerabilities  
✅ GitHub Advisories - Package-specific threats
```

### AI-Powered Analysis
```
🤖 Technical summaries (Gemini 1.5 Flash)
📊 Risk scoring (CVSS + EPSS + business context)
🎯 Impact matching (your apps vs vulnerabilities)
⚡ Remediation recommendations
```

## 📋 Example Workflow

### 1. View Latest Threats
```typescript
// Automatically fetches from all sources
GET /api/security-feed?limit=20

// Filter by source
GET /api/security-feed?source=CISA_KEV&limit=10
```

### 2. Analyze with AI
```typescript
// Click "AI Analysis" button in UI
POST /api/security-feed/analyze
{
  "article": {...},
  "userApplications": [...]
}

// Get structured insights
{
  "technicalSummary": "Buffer overflow in libssl...",
  "severity": "CRITICAL",
  "confidence": 0.95,
  "affectsUserApps": true,
  "recommendedActions": [
    "Update OpenSSL to version 3.0.11 or later",
    "Review all applications using affected versions",
    "Apply security patches within 24 hours"
  ]
}
```

### 3. Take Action
The AI tells you:
- ✅ Which of your apps are affected
- ✅ How severe the risk is (and why)
- ✅ What business impact to expect
- ✅ Exactly what to do next

## 🔧 Optional: GitHub Token (Higher Rate Limits)

Without token: **60 requests/hour**
With token: **5,000 requests/hour**

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token with `public_repo` scope
3. Add to `.env`:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

## 💡 Usage Tips

### Filter by Priority
```typescript
// Show only actively exploited
source=CISA_KEV

// Show only CVEs
source=NIST_NVD

// Show package advisories
source=GITHUB_ADVISORY
```

### Smart Caching
- Feed refreshes every **15 minutes**
- No need to manually refresh
- Automatically handles rate limits

### AI Analysis Strategy
- **Free tier**: 60 requests/minute (Gemini 1.5 Flash)
- **Cost**: ~$0.00035 per analysis
- **Tip**: Analyze high/critical severity first

## 📊 What You Get

### Before (Traditional Approach)
```
1. Check multiple sources manually
2. Read technical CVE descriptions
3. Guess which apps are affected
4. Research remediation steps
⏱️ Time: 30+ minutes per vulnerability
```

### After (AI-Powered Platform)
```
1. Click one button
2. Get instant analysis
3. See exactly which apps are affected
4. Follow clear remediation steps
⏱️ Time: 30 seconds per vulnerability
```

## 🎨 UI Features

### Visual Severity Indicators
- 🔴 **CRITICAL** - Red badge, urgent action required
- 🟠 **HIGH** - Orange badge, high priority
- 🟡 **MEDIUM** - Yellow badge, moderate priority
- 🔵 **LOW** - Blue badge, low priority

### Special Badges
- ⚠️ **Actively Exploited** - From CISA KEV
- 📊 **CVSS Score** - Industry standard severity
- 🎯 **Affects Your Apps** - Personal impact indicator
- ✨ **AI Analyzed** - Enhanced insights available

### Expandable Analysis
Click "View Analysis" to see:
- Technical summary
- Business impact
- Technical impact
- Risk reasoning
- Recommended actions
- Affected app details

## 🚨 Common Issues

### "No API key" error
```bash
# Verify .env file
cat .env | grep GEMINI_API_KEY

# If missing, add it
echo 'GEMINI_API_KEY=your_key' >> .env

# Redeploy
vercel --prod
```

### Rate limit errors
```bash
# Add GitHub token for higher limits
GITHUB_TOKEN=ghp_your_token

# Or wait 15 minutes for cache to refresh
```

### Authentication errors
```bash
# Clear browser cache
localStorage.clear();

# Re-login
# Navigate to /account and sign in again
```

## 📈 Next Steps

1. ✅ **Set up** - Add Gemini API key
2. ✅ **Deploy** - Push to production
3. ✅ **Explore** - Browse security feed
4. ✅ **Analyze** - Try AI analysis on a vulnerability
5. 🎯 **Integrate** - Set up email alerts (coming soon)
6. 📊 **Monitor** - Track your security posture

## 🎓 Learn More

- [Full Documentation](./SECURITY_INTELLIGENCE_PLATFORM.md)
- [API Reference](./SECURITY_INTELLIGENCE_PLATFORM.md#api-reference)
- [Troubleshooting Guide](./SECURITY_INTELLIGENCE_PLATFORM.md#troubleshooting)

## 💬 Support

Need help?
1. Check the [Troubleshooting Guide](./SECURITY_INTELLIGENCE_PLATFORM.md#troubleshooting)
2. Review Vercel deployment logs
3. Check browser console for errors

---

**Ready to secure your applications?** 🛡️

Just add your Gemini API key and deploy! The platform will start monitoring threats immediately.

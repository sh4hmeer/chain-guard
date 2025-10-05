# Security Intelligence Platform - Implementation Guide

## Overview

ChainGuard's Security Intelligence Platform provides **real-time threat intelligence** with **AI-powered analysis** using Google Gemini. This system aggregates security data from multiple authoritative sources and provides actionable insights tailored to your application inventory.

## Features

### 🔍 Multi-Source Security Feeds
- **NIST National Vulnerability Database (NVD)** - Comprehensive CVE database
- **CISA Known Exploited Vulnerabilities (KEV)** - Actively exploited vulnerabilities
- **GitHub Security Advisories** - Package-specific vulnerability advisories

### 🤖 AI-Powered Analysis
- **Technical Summaries** - Concise explanations of complex vulnerabilities
- **Risk Assessment** - Severity scoring based on multiple frameworks (CVSS, EPSS, business context)
- **Impact Analysis** - Automated matching against your application inventory
- **Recommended Actions** - Specific remediation steps

### 📊 Real-Time Impact Analytics
- **Application Matching** - Identifies which of your apps are affected
- **Severity Scoring** - Multi-factor risk assessment
- **Exploit Status** - Highlights actively exploited vulnerabilities
- **Confidence Levels** - AI analysis confidence scoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          SecurityFeed Component                       │  │
│  │  - Real-time feed display                             │  │
│  │  - AI analysis trigger                                │  │
│  │  - Impact visualization                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Vercel Serverless)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      /api/security-feed (GET)                         │  │
│  │      - Fetch aggregated feed                          │  │
│  │      - Cache management (15min)                       │  │
│  │                                                        │  │
│  │      /api/security-feed/analyze (POST)                │  │
│  │      - Gemini AI analysis                             │  │
│  │      - Impact matching                                │  │
│  │      - Risk framework scoring                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                External Data Sources                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  NIST NVD    │  │  CISA KEV    │  │  GitHub      │     │
│  │  REST API    │  │  JSON Feed   │  │  GraphQL     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI Analysis Engine                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Google Gemini 1.5 Flash                     │  │
│  │  - Technical summarization                            │  │
│  │  - Severity assessment (CVSS, EPSS, context)         │  │
│  │  - Business/technical impact analysis                │  │
│  │  - Remediation recommendations                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Add to your `.env` file:

```bash
# Already configured
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: For higher rate limits on GitHub API
GITHUB_TOKEN=ghp_your_github_personal_access_token
```

**Get Gemini API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

**Get GitHub Token (Optional):**
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select scope: `public_repo` (read-only)
4. Copy token to `.env` file

### 2. Install Dependencies

All required dependencies are already installed:
- `@google/generative-ai` - Gemini SDK
- `jose` - JWT verification for Auth0

### 3. Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or push to Git (auto-deployment)
git add .
git commit -m "Add security intelligence platform"
git push
```

## API Reference

### GET /api/security-feed

Fetch aggregated security feed from multiple sources.

**Query Parameters:**
- `source` (optional): Filter by source (`NIST_NVD`, `CISA_KEV`, `GITHUB_ADVISORY`)
- `limit` (optional): Number of articles per source (default: 20)

**Example Request:**
```typescript
const response = await fetch('/api/security-feed?source=CISA_KEV&limit=10', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});

const data = await response.json();
// {
//   success: true,
//   count: 10,
//   articles: [...]
// }
```

**Response Schema:**
```typescript
interface SecurityArticle {
  id: string;
  source: 'NIST_NVD' | 'GITHUB_ADVISORY' | 'CISA_KEV';
  title: string;
  description: string;
  publishedDate: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore?: number;
  cveId?: string;
  affectedProducts?: string[];
  exploited?: boolean;
}
```

### POST /api/security-feed/analyze

Analyze a security article with AI and match against user's applications.

**Request Body:**
```typescript
{
  article: SecurityArticle;
  userApplications?: Application[];
}
```

**Example Request:**
```typescript
const response = await fetch('/api/security-feed/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    article: selectedArticle,
    userApplications: userApps
  })
});

const data = await response.json();
// {
//   success: true,
//   article: {
//     ...originalArticle,
//     aiAnalysis: {...}
//   }
// }
```

**Response Schema:**
```typescript
interface AIAnalysis {
  technicalSummary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  businessImpact: string;
  technicalImpact: string;
  recommendedActions: string[];
  affectsUserApps: boolean;
  affectedAppDetails: string;
  analyzedAt: string;
}
```

## Frontend Usage

### SecurityFeed Component

The `SecurityFeed` component is already integrated into the application and accessible at `/security-feed`.

**Features:**
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔄 Auto-refresh from security sources
- 🎯 Source filtering (NIST, CISA, GitHub)
- ✨ One-click AI analysis
- 📊 Expandable analysis panels
- ⚠️ Impact warnings for affected apps

**Usage in App.tsx:**
```typescript
import SecurityFeed from './components/SecurityFeed';

// Protected route (requires authentication)
<Route
  path="/security-feed"
  element={
    <Protect
      Comp={() => <SecurityFeed />}
    />
  }
/>
```

### Custom Integration

You can also use the service directly:

```typescript
import { securityFeedService } from '../services/securityFeedService';

// Fetch from specific source
const articles = await securityFeedService.fetchNISTVulnerabilities(10);

// Fetch aggregated feed
const allArticles = await securityFeedService.getAggregatedFeed(20);

// Fetch CISA KEV (actively exploited)
const kev = await securityFeedService.fetchCISAKEV(15);
```

## AI Prompt Engineering

The system uses a sophisticated prompt to guide Gemini's analysis:

### Risk Framework Considerations
- **CVSS Scoring** - Standard vulnerability scoring
- **EPSS** - Exploit Prediction Scoring System
- **Active Exploitation** - CISA KEV status
- **Attack Complexity** - Ease of exploitation
- **Required Privileges** - Access level needed
- **User Interaction** - Social engineering factor
- **Business Context** - Organizational impact

### Analysis Output
The AI provides structured JSON analysis:
- Technical summary (2-3 sentences)
- Severity with confidence score
- Reasoning for severity assignment
- Business impact assessment
- Technical impact details
- Prioritized remediation actions
- Application-specific impact (when relevant)

## Data Sources

### NIST National Vulnerability Database
- **URL**: https://services.nvd.nist.gov/rest/json/cves/2.0
- **Coverage**: All published CVEs
- **Update Frequency**: Continuously updated
- **Rate Limits**: 5 requests per 30 seconds (unauthenticated)
- **Cache Duration**: 15 minutes

### CISA Known Exploited Vulnerabilities
- **URL**: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
- **Coverage**: Actively exploited vulnerabilities
- **Update Frequency**: Daily
- **Rate Limits**: None (public JSON file)
- **Cache Duration**: 15 minutes

### GitHub Security Advisories
- **URL**: https://api.github.com/graphql
- **Coverage**: Package ecosystem vulnerabilities
- **Update Frequency**: Real-time
- **Rate Limits**: 5,000/hour (authenticated), 60/hour (unauthenticated)
- **Cache Duration**: 15 minutes

## Performance Optimization

### Caching Strategy
- **Client-side**: React state management
- **Server-side**: In-memory cache with 15-minute expiry
- **Benefits**: Reduced API calls, faster load times

### Rate Limit Management
- Aggressive caching prevents hitting rate limits
- Fallback handling for API errors
- Graceful degradation when sources are unavailable

### Cost Optimization
- Gemini 1.5 Flash model (cost-effective)
- On-demand AI analysis (user-triggered)
- Cached results reused across users (planned)

## Security Considerations

### Authentication
- All endpoints require Auth0 JWT authentication
- User-specific application inventory access
- Secure token verification using `jose` library

### Data Privacy
- No sensitive user data sent to Gemini
- Application inventory only shared for impact analysis
- Vulnerability data is public information

### Rate Limiting
- Implement user-level rate limiting (recommended)
- Monitor Gemini API usage
- Set quotas in Google Cloud Console

## Troubleshooting

### Issue: No articles loading

**Possible Causes:**
1. NIST API rate limiting
2. Network connectivity issues
3. Authentication token expired

**Solutions:**
```bash
# Check API connectivity
curl https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1

# Verify Auth0 token
console.log(localStorage.getItem('authToken'));

# Clear cache and reload
localStorage.clear();
location.reload();
```

### Issue: AI analysis fails

**Possible Causes:**
1. Missing `GEMINI_API_KEY`
2. API quota exceeded
3. Invalid request format

**Solutions:**
```bash
# Verify environment variable
echo $GEMINI_API_KEY

# Check Vercel logs
vercel logs

# Monitor quota in Google Cloud Console
https://console.cloud.google.com/apis/dashboard
```

### Issue: GitHub API rate limit

**Possible Causes:**
1. No GitHub token configured
2. Token has expired
3. Excessive requests

**Solutions:**
```bash
# Add GitHub token to .env
GITHUB_TOKEN=ghp_your_token

# Verify token is valid
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user

# Increase cache duration
# Edit api/security-feed.ts:
private cacheExpiry = 30 * 60 * 1000; // 30 minutes
```

## Future Enhancements

### Planned Features
- [ ] **Email/Slack Notifications** - Alert when high-severity vulnerabilities affect your apps
- [ ] **Historical Trend Analysis** - Track vulnerability trends over time
- [ ] **Custom Risk Scoring** - Adjust severity based on your organization's risk tolerance
- [ ] **Automated Remediation** - Generate PRs with dependency updates
- [ ] **Integration with Jira/ServiceNow** - Create tickets automatically
- [ ] **SLA Tracking** - Monitor time-to-remediation
- [ ] **Compliance Reporting** - Generate audit-ready reports

### Data Source Expansion
- [ ] **OSV (Open Source Vulnerabilities)** - Additional package ecosystems
- [ ] **Snyk Vulnerability Database** - Enhanced package coverage
- [ ] **ExploitDB** - Exploit code availability
- [ ] **VulnCheck** - Extended threat intelligence
- [ ] **Security News Feeds** - RSS aggregation from security blogs

### AI Enhancements
- [ ] **Multi-Model Analysis** - Compare Gemini, GPT, Claude outputs
- [ ] **Custom Fine-Tuning** - Train on your organization's data
- [ ] **Automated Triage** - Priority scoring based on your context
- [ ] **Remediation Code Generation** - AI-generated patches
- [ ] **Exploit Likelihood Prediction** - ML-based EPSS enhancement

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Check Vercel deployment logs
4. Review browser console for errors
5. Verify environment variables are set

## License

This implementation is part of ChainGuard and follows the same license as the main project.

---

**Last Updated:** 2025-10-04
**Version:** 1.0.0
**Author:** ChainGuard Development Team

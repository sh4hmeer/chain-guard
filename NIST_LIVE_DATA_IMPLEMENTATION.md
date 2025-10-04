# NIST NVD Live Data Implementation

## Overview
ChainGuard now fetches **live vulnerability data** from the NIST National Vulnerability Database (NVD) API instead of using mock data. This provides real-time CVE information for your applications.

## Implementation Summary

### 1. Live Vulnerability Fetching (`vulnerabilityService.ts`)

#### New Functions Added:

**`fetchLiveVulnerabilities(applications: Application[])`**
- Searches the NIST NVD API for CVEs related to each user application
- Searches by both application name AND vendor
- Implements rate limiting (6-second delay between requests to comply with NVD's 5 req/30sec limit)
- Deduplicates CVEs across multiple searches
- Automatically links vulnerabilities to affected applications
- Returns empty array if no applications provided

**`getVulnerabilities(applications: Application[], useLiveData: boolean)`**
- Main function that orchestrates vulnerability fetching
- `useLiveData = true` → Fetches from NIST NVD (default)
- `useLiveData = false` → Returns mock data
- Automatic fallback to mock data if:
  - NVD API is unavailable
  - No live vulnerabilities are found
  - Network errors occur

#### How It Works:
```typescript
// For each application in the user's inventory
For App in Applications:
  1. Search NVD for CVEs matching app.name (up to 20 results)
  2. Search NVD for CVEs matching app.vendor (up to 20 results)
  3. Combine and deduplicate results
  4. Convert NVD CVE format to ChainGuard format
  5. Link CVE to this application
  6. Wait 6 seconds (rate limiting)
  
Return all matched vulnerabilities
```

### 2. App.tsx Updates

#### State Management:
- Added `loadingVulnerabilities` state to track NVD API calls
- Removed dependency on `matchVulnerabilitiesToApps` (now handled internally)

#### Data Loading:
**When authenticated:**
```typescript
1. Fetch user's applications from MongoDB
2. Call getVulnerabilities(apps, true) → Live NIST data
3. Display loading indicator while fetching
4. Fallback to mock data on error
```

**When not authenticated (demo mode):**
```typescript
Use mock data for demonstration
```

#### Auto-Refresh:
- Vulnerabilities are re-fetched whenever:
  - User adds a new application
  - User removes an application
  - User logs in/out
  - Applications array length changes

### 3. DashboardOverview Component

#### Enhanced UI:
- **Loading Indicator**: Animated spinner while scanning NVD
- **Status Message**: "Scanning for live vulnerabilities..." during fetch
- **Empty State**: Shows message when no vulnerabilities found
- **Section Title**: Updated to "Recent Vulnerabilities from NIST NVD"

#### Visual Feedback:
```
[Loading State]
  🔄 Searching NIST National Vulnerability Database...
  This may take a moment as we scan for CVEs

[Success State]
  ✅ Displays up to 5 most recent CVEs with:
     - CVE ID and description
     - Severity badge (CRITICAL/HIGH/MEDIUM/LOW)
     - Published date
     - Affected applications

[Empty State]
  ⚠️ No vulnerabilities found
  Your applications appear to be secure
```

## API Rate Limiting

### NIST NVD API Limits:
- **Without API Key**: 5 requests per 30 seconds
- **With API Key**: 50 requests per 30 seconds (not implemented yet)

### Current Implementation:
- 6-second delay between requests
- ~10 requests per minute max
- For 10 applications = ~1-2 minutes to scan all

### Future Optimization:
- Add NVD API key configuration
- Implement request batching
- Cache CVE results (TTL: 24 hours)
- Background refresh jobs

## Data Flow

```
User Logs In
    ↓
App.tsx: Fetch applications from MongoDB
    ↓
App.tsx: Call getVulnerabilities(apps, true)
    ↓
vulnerabilityService: fetchLiveVulnerabilities(apps)
    ↓
For each app:
    → Search NVD by name
    → Search NVD by vendor
    → Convert CVE format
    → Match to applications
    → Wait 6 seconds
    ↓
Return live vulnerabilities
    ↓
App.tsx: setVulnerabilities(liveData)
    ↓
DashboardOverview: Display CVEs with loading states
```

## Example CVE Data

### NIST NVD Format:
```json
{
  "id": "CVE-2024-1234",
  "metrics": {
    "cvssMetricV31": [{
      "cvssData": {
        "baseScore": 9.8,
        "baseSeverity": "CRITICAL"
      }
    }]
  },
  "descriptions": [{
    "lang": "en",
    "value": "Critical vulnerability in XYZ..."
  }],
  "published": "2024-01-15T10:00:00.000"
}
```

### ChainGuard Format:
```typescript
{
  id: "CVE-2024-1234",
  title: "CVE-2024-1234",
  description: "Critical vulnerability in XYZ...",
  severity: "CRITICAL",
  cvssScore: 9.8,
  affectedApps: ["app-uuid-1", "app-uuid-2"],
  publishedDate: "2024-01-15T10:00:00.000",
  status: "open"
}
```

## Testing

### Manual Testing:
1. **Add an application** with a known vulnerable component:
   - Name: "Slack"
   - Vendor: "Slack Technologies"
   - Version: "4.0.0"

2. **Wait for scan**: Loading indicator appears

3. **View results**: Real CVEs from NVD displayed

4. **Check console**: Should see:
   ```
   Fetching CVEs from NVD for keyword: Slack
   Fetching CVEs from NVD for keyword: Slack Technologies
   ```

### Error Testing:
1. **Disconnect internet** → Should fallback to mock data
2. **Add 20+ apps** → Should respect rate limiting
3. **Add apps with no CVEs** → Should show "No vulnerabilities found"

## Configuration

### Environment Variables (Future):
```env
# Optional: Add to .env for higher rate limits
VITE_NVD_API_KEY=your-nist-api-key-here
```

### Toggle Live Data:
```typescript
// In App.tsx or as a user setting
const USE_LIVE_DATA = true; // Change to false for mock data

// Then pass to function:
const vulns = await getVulnerabilities(apps, USE_LIVE_DATA);
```

## Known Limitations

1. **Rate Limiting**: 6 seconds per app = slow for large inventories
2. **No Caching**: Re-fetches on every load (implement Redis/localStorage cache)
3. **Keyword Matching**: May return false positives (improve matching logic)
4. **No Version Filtering**: Returns CVEs for all versions (add version-specific filtering)
5. **No Background Jobs**: Manual refresh only (add scheduled scans)

## Future Enhancements

### Short Term:
- [ ] Add toggle button in UI to switch between live/mock data
- [ ] Implement CVE result caching (localStorage with TTL)
- [ ] Add "Last Scanned" timestamp display
- [ ] Show progress bar during multi-app scans

### Medium Term:
- [ ] Add NVD API key support for 10x rate limits
- [ ] Implement version-aware CVE matching
- [ ] Add severity filtering in UI
- [ ] Export CVE report to PDF/CSV

### Long Term:
- [ ] Background vulnerability scanning (cron jobs)
- [ ] Email alerts for new critical CVEs
- [ ] Integration with GitHub Security Advisories
- [ ] Machine learning for false positive reduction
- [ ] CVE remediation suggestions with links to patches

## Security Considerations

1. **API Key Storage**: Never commit NVD API keys to Git
2. **Rate Limiting**: Respect NVD terms of service
3. **Data Privacy**: CVE data is public, but user applications are private
4. **Validation**: Sanitize CVE data before displaying in UI
5. **Error Handling**: Don't expose sensitive error details to users

## Resources

- [NIST NVD API 2.0 Documentation](https://nvd.nist.gov/developers/vulnerabilities)
- [CVE Program](https://www.cve.org/)
- [CVSS Specification](https://www.first.org/cvss/)

---

**Status**: ✅ Implemented and Active  
**Last Updated**: 2024  
**Impact**: High - Provides real-time security intelligence from authoritative source

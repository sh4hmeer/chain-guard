# ChainGuard 🛡️# React + TypeScript + Vite



> **"Know when your apps turn against you."**This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



**Proactive Supply Chain Attack Monitoring Platform**While this project uses React, Vite supports many popular JS frameworks. [See all the supported frameworks](https://vitejs.dev/guide/#scaffolding-your-first-vite-project).



---## Deploy Your Own



## 🎯 The ProblemDeploy your own Vite project with Vercel.



In today's digital workplace, employees use dozens of third-party apps—from productivity tools to niche SaaS services. While these apps increase efficiency, they also open the door to **supply chain attacks**—where attackers compromise trusted vendors or software updates to infiltrate organizations.[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/vite-react&template=vite-react)



Companies often don't know when a system their employees rely on becomes vulnerable. Even if critical vulnerabilities or breaches are disclosed, organizations struggle to track which apps are affected and respond quickly._Live Example: https://vite-react-example.vercel.app_



---### Deploying From Your Terminal



## 💡 The SolutionYou can deploy your new Vite project with a single command from your terminal using [Vercel CLI](https://vercel.com/download):



**ChainGuard** is a monitoring platform that proactively scans and aggregates information about the applications employees use. It cross-checks:```shell

$ vercel

- 🔒 **Security databases** (CVE reports, NVD feeds, vendor security advisories)```

- 📰 **Trusted news outlets** and blogs for emerging supply chain attack reports
- ⚡ **Real-time monitoring** of vulnerabilities affecting your application stack

Whenever an app is flagged as vulnerable, ChainGuard automatically alerts IT/security teams and provides recommended actions.

---

## 🚀 How It Works

1. **App Inventory Integration**: Manually add apps or import via CSV to track the applications your organization uses
2. **Continuous Monitoring**: Uses NVD API and security feeds to monitor CVE databases and vendor advisories
3. **Intelligent Matching**: Automatically matches vulnerability reports to apps in your inventory
4. **Actionable Dashboard**: Single pane of glass for CISOs and IT admins to see which vulnerabilities directly impact their workforce

---

## ✨ Features

- 📊 **Dashboard Overview**: Real-time statistics on applications and vulnerabilities
- 📦 **Application Inventory**: Add apps manually or import via CSV
- 🔍 **Vulnerability Tracking**: See all CVEs affecting your applications
- 🎨 **Severity Classification**: Color-coded CRITICAL, HIGH, MEDIUM, LOW alerts
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔔 **Status Management**: Acknowledge and mark vulnerabilities as mitigated

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **API**: NVD CVE Database API
- **HTTP Client**: Axios

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/chain-guard.git
cd chain-guard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎮 Demo Flow

### Step 1: View Dashboard
- Navigate to the home page to see the security overview
- View statistics on total apps, vulnerabilities, and severity breakdown

### Step 2: Add Applications
- Go to "Applications" tab
- Click "Add App" to manually add applications (Slack, Zoom, GitHub, etc.)
- Or click "Import CSV" to bulk upload applications

**Example CSV format:**
```csv
name,vendor,version,category
Slack,Slack Technologies,4.35.0,Communication
Zoom,Zoom Video Communications,5.15.5,Video Conferencing
GitHub,GitHub,Enterprise Server 3.10,Development
```

### Step 3: Monitor Vulnerabilities
- Go to "Vulnerabilities" tab
- See all CVEs affecting your tracked applications
- Filter by severity level
- Click "Acknowledge" or "Mark Mitigated" to manage vulnerability status

### Step 4: Simulate Alert
- The app comes with mock vulnerabilities for Slack, Zoom, and GitHub
- When you add these apps, you'll see them automatically matched to relevant CVEs
- Dashboard will update with critical alerts

---

## 📁 Project Structure

```
chain-guard/
├── src/
│   ├── components/          # React components
│   │   ├── AppInventory.tsx        # Application management
│   │   ├── VulnerabilityList.tsx   # Vulnerability display
│   │   └── DashboardOverview.tsx   # Dashboard stats
│   ├── services/            # API and business logic
│   │   └── vulnerabilityService.ts # CVE fetching & matching
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts               # Type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── tailwind.config.js      # Tailwind configuration
└── vite.config.ts         # Vite configuration
```

---

## 🔌 API Integration

### NVD CVE Database

ChainGuard integrates with the National Vulnerability Database (NVD) API:

```typescript
// Fetch CVEs from NVD
const cves = await fetchCVEsFromNVD('slack', 10);

// Match to your applications
const matched = matchVulnerabilitiesToApps(vulnerabilities, applications);
```

**Note**: NVD API has rate limits (5 requests per 30 seconds without API key). For production use, register for an API key at https://nvd.nist.gov/developers/request-an-api-key

---

## 🎨 Customization

### Adding New Vulnerability Sources

Edit `src/services/vulnerabilityService.ts`:

```typescript
// Add your custom vulnerability source
export const fetchFromCustomSource = async () => {
  // Your implementation
};
```

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      danger: { /* your colors */ }
    }
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your hackathon or production needs!

---

## 🏆 Hackathon Notes

This project was built for a 36-hour hackathon with a focus on:
- ✅ Rapid MVP development
- ✅ Clean, maintainable code
- ✅ Professional UI/UX
- ✅ Real-world problem solving
- ✅ Scalable architecture

**Future Enhancements:**
- Backend API with persistent database (MongoDB/PostgreSQL)
- SSO integration (Okta, Azure AD)
- Slack/Teams webhook notifications
- Automated scanning schedules
- Export reports (PDF/CSV)
- Multi-tenant support
- Advanced filtering and search

---

## 👥 Team

Built with ❤️ by the ChainGuard team

---

**ChainGuard** - Protecting organizations from supply chain attacks, one vulnerability at a time.

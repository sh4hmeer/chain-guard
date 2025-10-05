import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 👇 Reuse the same auth helpers as your first snippet
import { verifyAuth0Token, handleUnauthorized } from '../server/middleware/auth.js';

// ───────────────────────────────────────────────────────────
// Gemini setup
// ───────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ───────────────────────────────────────────────────────────
// Handler
// ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (mirror first snippet’s style/headers)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔐 Verify JWT using shared middleware (same pattern as first file)
  // const authResult = await verifyAuth0Token(req);
  // if (!authResult.authorized) {
  //   return handleUnauthorized(res, authResult.error);
  // }

  // Pull user id (same as first file)
  // const userId = authResult.user?.sub as string;
  // if (!userId) {
  //   return res.status(401).json({ message: 'User ID not found in token' });
  // }

  try {
    switch (req.method) {
      // GET /api/security-feed — fetch aggregated security feed
      case 'GET': {
        const { source, limit = '20' } = req.query;
        const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50); // cap 50

        const articles = await fetchSecurityArticles(source as string, limitNum);

        return res.status(200).json({
          success: true,
          count: articles.length,
          articles
        });
      }

      // POST /api/security-feed/analyze — AI analysis for an article
      case 'POST': {
        const { article, userApplications } = req.body || {};
        if (!article) {
          return res.status(400).json({ error: 'Article data is required' });
        }

        if (!GEMINI_API_KEY || !genAI) {
          return res.status(503).json({
            error: 'Gemini API key not configured',
            details: 'Please set GEMINI_API_KEY environment variable',
          });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = buildAnalysisPrompt(article, userApplications);
        const result = await model.generateContent(prompt);
        const analysisText = result.response.text();
        const analysis = parseAIAnalysis(analysisText, article);

        return res.status(200).json({
          success: true,
          article: {
            ...article,
            aiAnalysis: analysis,
          },
        });
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in security-feed API:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

// ───────────────────────────────────────────────────────────
// Helpers (unchanged logic)
// ───────────────────────────────────────────────────────────

async function fetchSecurityArticles(source: string | undefined, limit: number) {
  const articles: SecurityArticle[] = [];

  // NIST NVD 
  if (!source || source === 'NIST_NVD') {
    try {
      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=${limit}`,
        { headers: { 'User-Agent': 'ChainGuard-Security-Platform/1.0' } }
      );
      if (!response.ok) {
        console.error('NIST API error:', response.status, response.statusText);
        throw new Error(`NIST API returned ${response.status}`);
      }
      const data = await response.json();

      const nistArticles =
        data.vulnerabilities?.map((item: any) => {
          const cve = item.cve;
          const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV2?.[0];
          return {
            id: cve.id,
            source: 'NIST_NVD',
            title: cve.id,
            description:
              cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description',
            publishedDate: cve.published,
            severity: metrics?.cvssData?.baseSeverity,
            cvssScore: metrics?.cvssData?.baseScore,
            cveId: cve.id,
            affectedProducts: extractAffectedProducts(cve),
            references: cve.references?.map((ref: any) => ref.url) || [],
          };
        }) || [];

      articles.push(...nistArticles);
    } catch (error) {
      console.error('NIST fetch error:', error);
    }
  }

  // CISA KEV
  if (!source || source === 'CISA_KEV') {
    try {
      const response = await fetch(
        'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
        { headers: { 'User-Agent': 'ChainGuard-Security-Platform/1.0' } }
      );
      if (!response.ok) {
        console.error('CISA API error:', response.status, response.statusText);
        throw new Error(`CISA API returned ${response.status}`);
      }
      const data = await response.json();

      const cisaArticles =
        data.vulnerabilities?.slice(0, limit).map((vuln: any) => ({
          id: vuln.cveID,
          source: 'CISA_KEV',
          title: `${vuln.cveID}: ${vuln.vulnerabilityName}`,
          description: `${vuln.shortDescription} - Vendor: ${vuln.vendorProject}, Product: ${vuln.product}`,
          publishedDate: vuln.dateAdded,
          severity: 'CRITICAL',
          cveId: vuln.cveID,
          affectedProducts: [`${vuln.vendorProject}:${vuln.product}`],
          exploited: true,
        })) || [];

      articles.push(...cisaArticles);
    } catch (error) {
      console.error('CISA fetch error:', error);
    }
  }

  return articles.sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
}

function extractAffectedProducts(cve: any): string[] {
  const products: string[] = [];
  cve.configurations?.nodes?.forEach((node: any) => {
    node.cpeMatch?.forEach((cpe: any) => {
      // cpe:2.3:a:vendor:product:version:...
      const parts = cpe.criteria.split(':');
      if (parts.length >= 5) {
        const vendor = parts[3];
        const product = parts[4];
        products.push(`${vendor}:${product}`);
      }
    });
  });
  return [...new Set(products)];
}

function buildAnalysisPrompt(article: any, userApplications?: any[]): string {
  const appContext = userApplications?.length
    ? `\n\nUser's Application Inventory:\n${userApplications
        .map(
          (app) => `- ${app.name} (${app.version}): ${app.dependencies?.join(', ') || 'N/A'}`
        )
        .join('\n')}`
    : '';

  return `You are a cybersecurity expert analyzing a security vulnerability or threat intelligence article.

**Article Details:**
- Title: ${article.title}
- Source: ${article.source}
- Published: ${article.publishedDate}
- CVE ID: ${article.cveId || 'N/A'}
- Current Severity: ${article.severity || 'Not assigned'}
- CVSS Score: ${article.cvssScore || 'N/A'}
- Description: ${article.description}
- Affected Products: ${article.affectedProducts?.join(', ') || 'Unknown'}
${appContext}

**Your Task:**
Provide a comprehensive security analysis in the following JSON format:

{
  "technicalSummary": "2-3 sentence technical summary of the vulnerability/threat",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "confidence": 0.0-1.0,
  "reasoning": "Why you assigned this severity level",
  "businessImpact": "How this could impact an organization's operations",
  "technicalImpact": "Technical consequences (data breach, system compromise, etc.)",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"],
  "affectsUserApps": true|false,
  "affectedAppDetails": "If user apps are affected, explain which ones and why"
}

**Risk Framework Considerations:**
- CVSS scoring methodology
- EPSS (Exploit Prediction Scoring System)
- Active exploitation status
- Attack complexity
- Required privileges
- User interaction requirements
- Business context and impact

Provide ONLY the JSON response, no additional text.`;
}

function parseAIAnalysis(analysisText: string, originalArticle: any) {
  try {
    // Handle possible fenced code blocks
    const jsonMatch =
      analysisText.match(/```json\s*([\s\S]*?)\s*```/) ||
      analysisText.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : analysisText;

    const parsed = JSON.parse(jsonText);
    return {
      technicalSummary: parsed.technicalSummary || '',
      severity: parsed.severity || originalArticle.severity || 'UNKNOWN',
      confidence: parsed.confidence ?? 0.8,
      reasoning: parsed.reasoning || '',
      businessImpact: parsed.businessImpact || '',
      technicalImpact: parsed.technicalImpact || '',
      recommendedActions: parsed.recommendedActions || [],
      affectsUserApps: parsed.affectsUserApps || false,
      affectedAppDetails: parsed.affectedAppDetails || '',
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    return {
      technicalSummary: analysisText.substring(0, 200),
      severity: originalArticle.severity || 'UNKNOWN',
      confidence: 0.5,
      reasoning: 'AI analysis could not be parsed',
      businessImpact: 'Unknown',
      technicalImpact: 'Unknown',
      recommendedActions: ['Review vulnerability details manually'],
      affectsUserApps: false,
      affectedAppDetails: '',
      analyzedAt: new Date().toISOString(),
    };
  }
}

// ───────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────
interface SecurityArticle {
  id: string;
  source: string;
  title: string;
  description: string;
  publishedDate: string;
  severity?: string;
  cvssScore?: number;
  cveId?: string;
  affectedProducts?: string[];
  exploited?: boolean;
  references?: string[];
}

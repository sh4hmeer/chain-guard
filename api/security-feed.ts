import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jwtVerify } from 'jose';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Security Feed API with AI Analysis
 * Provides real-time security intelligence with Gemini-powered insights
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth verification
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
    const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
    
    const JWKS = await fetch(jwksUrl).then(r => r.json());
    const key = await importJWK(JWKS.keys[0]);
    
    await jwtVerify(token, key, {
      issuer: `https://${AUTH0_DOMAIN}/`,
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // GET /api/security-feed - Fetch aggregated security feed
  if (req.method === 'GET') {
    try {
      const { source, limit = '20' } = req.query;
      const limitNum = parseInt(limit as string, 10);

      const articles = await fetchSecurityArticles(source as string, limitNum);
      
      return res.status(200).json({
        success: true,
        count: articles.length,
        articles,
      });
    } catch (error: any) {
      console.error('Error fetching security feed:', error);
      return res.status(500).json({
        error: 'Failed to fetch security feed',
        details: error.message,
      });
    }
  }

  // POST /api/security-feed/analyze - Analyze article with Gemini AI
  if (req.method === 'POST' && req.url?.includes('/analyze')) {
    try {
      const { article, userApplications } = req.body;

      if (!article) {
        return res.status(400).json({ error: 'Article data is required' });
      }

      if (!GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: 'Gemini API key not configured',
          details: 'Please set GEMINI_API_KEY environment variable'
        });
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build comprehensive analysis prompt
      const prompt = buildAnalysisPrompt(article, userApplications);

      const result = await model.generateContent(prompt);
      const analysisText = result.response.text();

      // Parse AI response into structured format
      const analysis = parseAIAnalysis(analysisText, article);

      return res.status(200).json({
        success: true,
        article: {
          ...article,
          aiAnalysis: analysis,
        },
      });
    } catch (error: any) {
      console.error('Error analyzing article:', error);
      return res.status(500).json({
        error: 'Failed to analyze article',
        details: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Fetch security articles from various sources
 */
async function fetchSecurityArticles(source: string | undefined, limit: number) {
  const articles: any[] = [];

  // NIST NVD
  if (!source || source === 'NIST_NVD') {
    try {
      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=${limit}&sortBy=published&orderBy=desc`
      );
      const data = await response.json();
      
      const nistArticles = data.vulnerabilities?.map((item: any) => {
        const cve = item.cve;
        const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV2?.[0];
        
        return {
          id: cve.id,
          source: 'NIST_NVD',
          title: cve.id,
          description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description',
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
        'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
      );
      const data = await response.json();
      
      const cisaArticles = data.vulnerabilities?.slice(0, limit).map((vuln: any) => ({
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

  return articles.sort((a, b) => 
    new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
}

/**
 * Extract affected products from CVE data
 */
function extractAffectedProducts(cve: any): string[] {
  const products: string[] = [];
  
  cve.configurations?.nodes?.forEach((node: any) => {
    node.cpeMatch?.forEach((cpe: any) => {
      // Parse CPE format: cpe:2.3:a:vendor:product:version...
      const parts = cpe.criteria.split(':');
      if (parts.length >= 5) {
        const vendor = parts[3];
        const product = parts[4];
        products.push(`${vendor}:${product}`);
      }
    });
  });
  
  return [...new Set(products)]; // Remove duplicates
}

/**
 * Build comprehensive analysis prompt for Gemini
 */
function buildAnalysisPrompt(article: any, userApplications?: any[]): string {
  const appContext = userApplications?.length 
    ? `\n\nUser's Application Inventory:\n${userApplications.map(app => 
        `- ${app.name} (${app.version}): ${app.dependencies?.join(', ') || 'N/A'}`
      ).join('\n')}`
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

/**
 * Parse AI analysis into structured format
 */
function parseAIAnalysis(analysisText: string, originalArticle: any) {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     analysisText.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
    
    const parsed = JSON.parse(jsonText);
    
    return {
      technicalSummary: parsed.technicalSummary || '',
      severity: parsed.severity || originalArticle.severity || 'UNKNOWN',
      confidence: parsed.confidence || 0.8,
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

/**
 * Helper to import JWK (simplified - use jose library in production)
 */
async function importJWK(jwk: any) {
  const keyData = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return keyData;
}

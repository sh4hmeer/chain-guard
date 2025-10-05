import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
// import { jwtVerify, importJWK as importJWKFromJose } from 'jose';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function listAvailableModels() {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}` }
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`ListModels failed: ${res.status} ${res.statusText} ${txt}`);
    }
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('listAvailableModels error:', err);
    return null;
  }
}

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
}

/**
 * Analyze Security Article with Gemini AI
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth verification
  // try {
  //   const authHeader = req.headers.authorization;
  //   if (!authHeader?.startsWith('Bearer ')) {
  //     return res.status(401).json({ error: 'Missing authorization token' });
  //   }

  //   const token = authHeader.substring(7);
  //   const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
    
  //   if (!AUTH0_DOMAIN) {
  //     console.error('AUTH0_DOMAIN not configured');
  //     return res.status(500).json({ error: 'Server configuration error' });
  //   }
    
  //   const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
  //   const jwksResponse = await fetch(jwksUrl);
    
  //   if (!jwksResponse.ok) {
  //     throw new Error('Failed to fetch JWKS');
  //   }
    
  //   const JWKS = await jwksResponse.json();
  //   const publicKey = await importJWKFromJose(JWKS.keys[0], 'RS256');
    
  //   await jwtVerify(token, publicKey, {
  //     issuer: `https://${AUTH0_DOMAIN}/`,
  //   });
  // } catch (error) {
  //   console.error('Auth error:', error);
  //   return res.status(401).json({ error: 'Invalid token' });
  // }

  // Analyze article
  try {
    const { article, userApplications } = req.body;

    if (!article) {
      return res.status(400).json({ error: 'Article data is required' });
    }

    if (!GEMINI_API_KEY || !genAI) {
      return res.status(503).json({
        error: 'Gemini API key not configured',
        details: 'Please set GEMINI_API_KEY environment variable'
      });
    }

  // Choose model via env or default
  const requestedModel = process.env.GENERATIVE_MODEL || 'gemini-pro';

    // Attempt to instantiate and call the model, but handle "model not found" gracefully
    let model;
    try {
      model = genAI.getGenerativeModel({ model: requestedModel });
    } catch (err: any) {
      console.error('Model selection failed:', err?.message || err);
      return res.status(503).json({
        error: 'Requested generative model not available',
        details: err?.message || String(err),
        hint: 'Set GENERATIVE_MODEL to a supported model name or call ListModels to see available models'
      });
    }

    let result;
    try {
      const prompt = buildAnalysisPrompt(article, userApplications);
      result = await model.generateContent(prompt);
    } catch (err: any) {
      console.error('Model generation error:', err);
      // If API returns 404 for model or version mismatch
      const isNotFound = err?.message && String(err.message).includes('404');
      if (isNotFound) {
        try {
          const list = await listAvailableModels();
          return res.status(502).json({
            error: 'Generative model request failed',
            details: err?.message || String(err),
            availableModels: list?.models || list
          });
        } catch (listErr: any) {
          console.error('Failed to list models after 404:', listErr);
          return res.status(502).json({
            error: 'Generative model request failed',
            details: err?.message || String(err),
            availableModelsError: listErr?.message || String(listErr)
          });
        }
      }

      return res.status(502).json({
        error: 'Generative model request failed',
        details: err?.message || String(err)
      });
    }

    const analysisText = result.response.text();
    const analysis = parseAIAnalysis(analysisText, article);
    

    return res.status(200).json({
      success: true,
      article: {
        ...article,
        aiAnalysis: analysis,
      },
    });
  } catch (error) {
    console.error('Error analyzing article:', error);
    return res.status(500).json({
      error: 'Failed to analyze article',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Build comprehensive analysis prompt for Gemini
 */
function buildAnalysisPrompt(article: SecurityArticle, userApplications?: unknown[]): string {
  const appContext = Array.isArray(userApplications) && userApplications.length 
    ? `\n\nUser's Application Inventory:\n${userApplications.map((app: unknown) => {
        const a = app as { name?: string; version?: string; dependencies?: string[] };
        return `- ${a.name || 'Unknown'} (${a.version || 'N/A'}): ${a.dependencies?.join(', ') || 'N/A'}`;
      }).join('\n')}`
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
function parseAIAnalysis(analysisText: string, originalArticle: SecurityArticle) {
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

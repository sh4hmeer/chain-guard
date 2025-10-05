/**
 * Security Feed Aggregation Service
 * Collects real-time security data from multiple open-source feeds
 */

export interface SecurityArticle {
  id: string;
  source: 'NIST_NVD' | 'GITHUB_ADVISORY' | 'CISA_KEV' | 'SECURITY_NEWS';
  title: string;
  description: string;
  publishedDate: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  cvssScore?: number;
  cveId?: string;
  affectedProducts?: string[];
  references?: string[];
  rawData?: any;
}

export interface AIAnalyzedArticle extends SecurityArticle {
  aiSummary?: string;
  aiRiskAssessment?: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    reasoning: string;
    businessImpact: string;
    technicalImpact: string;
    recommendedActions: string[];
  };
  impactAnalysis?: {
    affectsUserApps: boolean;
    affectedAppCount: number;
    affectedApps: Array<{
      appId: string;
      appName: string;
      matchReason: string;
    }>;
  };
}

class SecurityFeedService {
  private cacheExpiry = 15 * 60 * 1000; // 15 minutes
  private cache: Map<string, { data: SecurityArticle[]; timestamp: number }> = new Map();

  /**
   * Fetch latest vulnerabilities from NIST NVD
   */
  async fetchNISTVulnerabilities(limit: number = 20): Promise<SecurityArticle[]> {
    const cacheKey = `nist_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // NIST NVD API 2.0
      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=${limit}&sortBy=published&orderBy=desc`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`NIST API error: ${response.status}`);
      }

      const data = await response.json();
      const articles: SecurityArticle[] = data.vulnerabilities?.map((item: any) => {
        const cve = item.cve;
        const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV2?.[0];
        
        return {
          id: cve.id,
          source: 'NIST_NVD' as const,
          title: cve.id,
          description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description',
          publishedDate: cve.published,
          severity: this.mapCVSSSeverity(metrics?.cvssData?.baseSeverity),
          cvssScore: metrics?.cvssData?.baseScore,
          cveId: cve.id,
          affectedProducts: cve.configurations?.nodes?.flatMap((node: any) =>
            node.cpeMatch?.map((cpe: any) => cpe.criteria) || []
          ) || [],
          references: cve.references?.map((ref: any) => ref.url) || [],
          rawData: item,
        };
      }) || [];

      this.setCache(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error('Error fetching NIST data:', error);
      return [];
    }
  }

  /**
   * Fetch GitHub Security Advisories
   */
  async fetchGitHubAdvisories(limit: number = 20): Promise<SecurityArticle[]> {
    const cacheKey = `github_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // GitHub GraphQL API for security advisories
      const query = `
        query {
          securityAdvisories(first: ${limit}, orderBy: {field: PUBLISHED_AT, direction: DESC}) {
            nodes {
              id
              ghsaId
              summary
              description
              severity
              publishedAt
              cvss {
                score
              }
              identifiers {
                type
                value
              }
              references {
                url
              }
              vulnerabilities(first: 10) {
                nodes {
                  package {
                    name
                    ecosystem
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Note: For production, add GitHub token: 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const articles: SecurityArticle[] = data.data?.securityAdvisories?.nodes?.map((advisory: any) => ({
        id: advisory.ghsaId,
        source: 'GITHUB_ADVISORY' as const,
        title: advisory.summary,
        description: advisory.description || advisory.summary,
        publishedDate: advisory.publishedAt,
        severity: advisory.severity as any,
        cvssScore: advisory.cvss?.score,
        cveId: advisory.identifiers?.find((i: any) => i.type === 'CVE')?.value,
        affectedProducts: advisory.vulnerabilities?.nodes?.map(
          (v: any) => `${v.package.ecosystem}:${v.package.name}`
        ) || [],
        references: advisory.references?.map((ref: any) => ref.url) || [],
        rawData: advisory,
      })) || [];

      this.setCache(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error('Error fetching GitHub advisories:', error);
      return [];
    }
  }

  /**
   * Fetch CISA Known Exploited Vulnerabilities
   */
  async fetchCISAKEV(limit: number = 20): Promise<SecurityArticle[]> {
    const cacheKey = `cisa_kev_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
      
      if (!response.ok) {
        throw new Error(`CISA API error: ${response.status}`);
      }

      const data = await response.json();
      const articles: SecurityArticle[] = data.vulnerabilities
        ?.slice(0, limit)
        .map((vuln: any) => ({
          id: vuln.cveID,
          source: 'CISA_KEV' as const,
          title: `${vuln.cveID}: ${vuln.vulnerabilityName}`,
          description: `${vuln.shortDescription} - Vendor: ${vuln.vendorProject}, Product: ${vuln.product}`,
          publishedDate: vuln.dateAdded,
          severity: 'CRITICAL' as const, // CISA KEV are all actively exploited
          cveId: vuln.cveID,
          affectedProducts: [`${vuln.vendorProject}:${vuln.product}`],
          references: vuln.notes ? [vuln.notes] : [],
          rawData: vuln,
        })) || [];

      this.setCache(cacheKey, articles);
      return articles;
    } catch (error) {
      console.error('Error fetching CISA KEV:', error);
      return [];
    }
  }

  /**
   * Get aggregated feed from all sources
   */
  async getAggregatedFeed(limitPerSource: number = 10): Promise<SecurityArticle[]> {
    const [nist, github, cisa] = await Promise.all([
      this.fetchNISTVulnerabilities(limitPerSource),
      this.fetchGitHubAdvisories(limitPerSource),
      this.fetchCISAKEV(limitPerSource),
    ]);

    // Combine and sort by published date
    const combined = [...nist, ...github, ...cisa];
    return combined.sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  }

  /**
   * Map CVSS severity string to our enum
   */
  private mapCVSSSeverity(severity?: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' {
    if (!severity) return 'UNKNOWN';
    const upper = severity.toUpperCase();
    if (upper === 'CRITICAL' || upper === 'HIGH' || upper === 'MEDIUM' || upper === 'LOW') {
      return upper as any;
    }
    return 'UNKNOWN';
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string): SecurityArticle[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: SecurityArticle[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export const securityFeedService = new SecurityFeedService();

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SecurityArticle {
  id: string;
  source: 'NIST_NVD' | 'GITHUB_ADVISORY' | 'CISA_KEV';
  title: string;
  description: string;
  publishedDate: string;
  severity?: string;
  cvssScore?: number;
  cveId?: string;
  affectedProducts?: string[];
  exploited?: boolean;
  aiAnalysis?: {
    technicalSummary: string;
    severity: string;
    confidence: number;
    reasoning: string;
    businessImpact: string;
    technicalImpact: string;
    recommendedActions: string[];
    affectsUserApps: boolean;
    affectedAppDetails: string;
  };
}

export default function SecurityFeed() {
  const [articles, setArticles] = useState<SecurityArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [analyzingArticles, setAnalyzingArticles] = useState<Set<string>>(new Set());


  const fetchSecurityFeed = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const source = selectedSource === 'all' ? '' : selectedSource;
      
      const response = await fetch(
        `/api/security-feed?source=${source}&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching security feed:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSource]);

  useEffect(() => {
    fetchSecurityFeed();
  }, [fetchSecurityFeed]);

  const analyzeArticle = async (article: SecurityArticle) => {
    setAnalyzingArticles(prev => new Set(prev).add(article.id));
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch user's applications for impact analysis
      const appsResponse = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const appsData = await appsResponse.json();
      
      const response = await fetch('/api/security-feed-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          article,
          userApplications: appsData.applications || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(prev => 
          prev.map(a => a.id === article.id ? data.article : a)
        );
        setExpandedArticles(prev => new Set(prev).add(article.id));
      } else {
        const errorData = await response.json();
        console.error('Analysis failed:', errorData);
        alert(`Failed to analyze: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error analyzing article:', error);
      alert('Failed to analyze article. Please try again.');
    } finally {
      setAnalyzingArticles(prev => {
        const next = new Set(prev);
        next.delete(article.id);
        return next;
      });
    }
  };

  const toggleArticle = (articleId: string) => {
    setExpandedArticles(prev => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'NIST_NVD': return { label: 'NIST NVD', color: 'bg-blue-100 text-blue-700' };
      case 'CISA_KEV': return { label: 'CISA KEV', color: 'bg-red-100 text-red-700' };
      case 'GITHUB_ADVISORY': return { label: 'GitHub', color: 'bg-purple-100 text-purple-700' };
      default: return { label: source, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            Security Intelligence Feed
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time threat intelligence with AI-powered analysis
          </p>
        </div>
        
        {/* Source Filter */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Sources</option>
          <option value="NIST_NVD">NIST NVD</option>
          <option value="CISA_KEV">CISA KEV (Exploited)</option>
          <option value="GITHUB_ADVISORY">GitHub Advisories</option>
        </select>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => {
            const isExpanded = expandedArticles.has(article.id);
            const isAnalyzing = analyzingArticles.has(article.id);
            const sourceBadge = getSourceBadge(article.source);

            return (
              <div
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Article Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${sourceBadge.color}`}>
                          {sourceBadge.label}
                        </span>
                        {article.severity && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(article.severity)}`}>
                            {article.severity}
                          </span>
                        )}
                        {article.cvssScore && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                            CVSS {article.cvssScore.toFixed(1)}
                          </span>
                        )}
                        {article.exploited && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Actively Exploited
                          </span>
                        )}
                        {article.aiAnalysis?.affectsUserApps && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Affects Your Apps
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {article.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {article.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          {new Date(article.publishedDate).toLocaleDateString()}
                        </span>
                        {article.cveId && <span>{article.cveId}</span>}
                        {article.affectedProducts && article.affectedProducts.length > 0 && (
                          <span>{article.affectedProducts.length} affected products</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!article.aiAnalysis ? (
                        <button
                          onClick={() => analyzeArticle(article)}
                          disabled={isAnalyzing}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-all"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              AI Analysis
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleArticle(article.id)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Analysis
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Analysis
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Panel */}
                  {article.aiAnalysis && isExpanded && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">AI Security Analysis</h4>
                        <span className="ml-auto text-xs text-purple-600">
                          {(article.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>

                      {/* Technical Summary */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Technical Summary</h5>
                        <p className="text-sm text-gray-700">{article.aiAnalysis.technicalSummary}</p>
                      </div>

                      {/* Impact Analysis */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Business Impact</h5>
                          <p className="text-sm text-gray-700">{article.aiAnalysis.businessImpact}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Technical Impact</h5>
                          <p className="text-sm text-gray-700">{article.aiAnalysis.technicalImpact}</p>
                        </div>
                      </div>

                      {/* Severity Reasoning */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">Risk Assessment</h5>
                        <p className="text-sm text-gray-700">{article.aiAnalysis.reasoning}</p>
                      </div>

                      {/* Affected Apps Warning */}
                      {article.aiAnalysis.affectsUserApps && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <h5 className="text-sm font-semibold text-red-900">Impact on Your Applications</h5>
                          </div>
                          <p className="text-sm text-red-700">{article.aiAnalysis.affectedAppDetails}</p>
                        </div>
                      )}

                      {/* Recommended Actions */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</h5>
                        <ul className="space-y-1">
                          {article.aiAnalysis.recommendedActions.map((action, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {articles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No security articles found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, TrendingUp, Sparkles, ChevronDown, ChevronUp, Zap, Loader2 } from 'lucide-react';

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
      case 'CRITICAL': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'LOW': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'NIST_NVD': return { label: 'NIST NVD', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'CISA_KEV': return { label: 'CISA KEV', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'GITHUB_ADVISORY': return { label: 'GitHub', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default: return { label: source, color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight flex items-center gap-3">
              <Shield className="text-blue-400" size={48} />
              Security Feed
            </h1>
            <p className="text-slate-400 font-light">
              Real-time threat intelligence with AI-powered analysis
            </p>
          </div>
          
          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-white/10 transition-all duration-200 font-medium"
          >
            <option value="all" className="bg-slate-900">All Sources</option>
            <option value="NIST_NVD" className="bg-slate-900">NIST NVD</option>
            <option value="CISA_KEV" className="bg-slate-900">CISA KEV (Exploited)</option>
            <option value="GITHUB_ADVISORY" className="bg-slate-900">GitHub Advisories</option>
          </select>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-16 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={48} />
            <p className="text-slate-300 font-light">Loading security intelligence...</p>
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Article Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${sourceBadge.color} hover:scale-105 transition-transform duration-200`}>
                            {sourceBadge.label}
                          </span>
                          {article.severity && (
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getSeverityColor(article.severity)} hover:scale-105 transition-transform duration-200`}>
                              {article.severity}
                            </span>
                          )}
                          {article.cvssScore && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/20 text-white">
                              CVSS {article.cvssScore.toFixed(1)}
                            </span>
                          )}
                          {article.exploited && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 flex items-center gap-1.5 hover:scale-105 transition-transform duration-200">
                              <Zap className="w-3 h-3" />
                              Actively Exploited
                            </span>
                          )}
                          {article.aiAnalysis?.affectsUserApps && (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 hover:scale-105 transition-transform duration-200">
                              <TrendingUp className="w-3 h-3" />
                              Affects Your Apps
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-white tracking-tight">
                          {article.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-300 font-light leading-relaxed">
                          {article.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-slate-400 font-light">
                          <span>
                            {new Date(article.publishedDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          {article.cveId && <span className="text-blue-300">{article.cveId}</span>}
                          {article.affectedProducts && article.affectedProducts.length > 0 && (
                            <span>{article.affectedProducts.length} affected products</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3">
                        {!article.aiAnalysis ? (
                          <button
                            onClick={() => analyzeArticle(article)}
                            disabled={isAnalyzing}
                            className="group px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/10"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="animate-spin" size={16} />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-200" />
                                AI Analysis
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleArticle(article.id)}
                            className="px-6 py-3 bg-white/5 border border-white/20 text-slate-300 rounded-xl hover:bg-white/10 hover:border-white/30 flex items-center gap-2 text-sm font-medium transition-all duration-200"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={16} />
                                Hide Analysis
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                View Analysis
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Analysis Panel */}
                    {article.aiAnalysis && isExpanded && (
                      <div className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-purple-500/20">
                          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                            <Sparkles className="text-purple-300" size={20} />
                          </div>
                          <h4 className="text-lg font-semibold text-white tracking-tight">AI Security Analysis</h4>
                          <span className="ml-auto px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-semibold">
                            {(article.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>

                        {/* Technical Summary */}
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Technical Summary</h5>
                          <p className="text-sm text-slate-300 font-light leading-relaxed">{article.aiAnalysis.technicalSummary}</p>
                        </div>

                        {/* Impact Analysis */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-white mb-2">Business Impact</h5>
                            <p className="text-sm text-slate-300 font-light leading-relaxed">{article.aiAnalysis.businessImpact}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-white mb-2">Technical Impact</h5>
                            <p className="text-sm text-slate-300 font-light leading-relaxed">{article.aiAnalysis.technicalImpact}</p>
                          </div>
                        </div>

                        {/* Severity Reasoning */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-white mb-2">Risk Assessment</h5>
                          <p className="text-sm text-slate-300 font-light leading-relaxed">{article.aiAnalysis.reasoning}</p>
                        </div>

                        {/* Affected Apps Warning */}
                        {article.aiAnalysis.affectsUserApps && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="text-red-400" size={18} />
                              <h5 className="text-sm font-semibold text-red-300">Impact on Your Applications</h5>
                            </div>
                            <p className="text-sm text-red-200 font-light leading-relaxed">{article.aiAnalysis.affectedAppDetails}</p>
                          </div>
                        )}

                        {/* Recommended Actions */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-white mb-3">Recommended Actions</h5>
                          <ul className="space-y-2">
                            {article.aiAnalysis.recommendedActions.map((action, idx) => (
                              <li key={idx} className="text-sm text-slate-300 font-light flex items-start gap-3 leading-relaxed">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
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
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">No Articles Found</h3>
                <p className="text-slate-400 font-light">Try adjusting your source filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { DashboardStats, Vulnerability } from '../types';
import { Shield, AlertTriangle, Activity, TrendingUp, Loader2 } from 'lucide-react';

interface DashboardOverviewProps {
  stats: DashboardStats;
  vulnerabilities: Vulnerability[];
  loadingVulnerabilities?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  vulnerabilities,
  loadingVulnerabilities = false
}) => {
  const recentVulnerabilities = vulnerabilities
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 5);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => {
    // Color-specific styles with gradients and glows - MORE VIBRANT
    const getColorStyles = () => {
      switch (color) {
        case '#3b82f6': // Blue - Applications
          return {
            bg: 'bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-blue-700/5',
            border: 'border-blue-400/30',
            hoverBorder: 'group-hover:border-blue-400/60',
            iconBg: 'bg-blue-500/20',
            iconBorder: 'border-blue-400/50',
            iconColor: 'text-blue-300',
            shadow: 'group-hover:shadow-xl group-hover:shadow-blue-500/30'
          };
        case '#ef4444': // Red - Vulnerabilities
          return {
            bg: 'bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-700/5',
            border: 'border-red-400/30',
            hoverBorder: 'group-hover:border-red-400/60',
            iconBg: 'bg-red-500/20',
            iconBorder: 'border-red-400/50',
            iconColor: 'text-red-300',
            shadow: 'group-hover:shadow-xl group-hover:shadow-red-500/30'
          };
        case '#dc2626': // Dark Red - Critical
          return {
            bg: 'bg-gradient-to-br from-rose-500/20 via-rose-600/10 to-rose-700/5',
            border: 'border-rose-400/30',
            hoverBorder: 'group-hover:border-rose-400/60',
            iconBg: 'bg-rose-500/20',
            iconBorder: 'border-rose-400/50',
            iconColor: 'text-rose-300',
            shadow: 'group-hover:shadow-xl group-hover:shadow-rose-500/30'
          };
        case '#f59e0b': // Orange - High Priority
          return {
            bg: 'bg-gradient-to-br from-orange-400/20 via-orange-500/10 to-orange-600/5',
            border: 'border-orange-400/30',
            hoverBorder: 'group-hover:border-orange-400/60',
            iconBg: 'bg-orange-500/20',
            iconBorder: 'border-orange-400/50',
            iconColor: 'text-orange-300',
            shadow: 'group-hover:shadow-xl group-hover:shadow-orange-500/30'
          };
        default:
          return {
            bg: 'bg-white/5',
            border: 'border-white/10',
            hoverBorder: 'group-hover:border-white/20',
            iconBg: 'bg-white/5',
            iconBorder: 'border-white/10',
            iconColor: 'text-white/80',
            shadow: ''
          };
      }
    };

    const styles = getColorStyles();

    return (
      <div className={`group relative ${styles.bg} backdrop-blur-sm border ${styles.border} ${styles.hoverBorder} rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 ${styles.shadow}`}>
        {/* Subtle animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
        
        <div className="relative flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-lg ${styles.iconBg} border ${styles.iconBorder} group-hover:scale-110 transition-all duration-300`}>
            <Icon size={20} className={`${styles.iconColor} group-hover:drop-shadow-lg transition-all duration-300`} />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">{value}</p>
            <p className="text-xs font-medium text-white/60 uppercase tracking-wider">{title}</p>
          </div>
        </div>
        {subtitle && (
          <p className="relative text-xs text-white/50 font-light">{subtitle}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Minimal Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-400 font-light">
            Real-time security intelligence for your stack
          </p>
        </div>

        {/* Stats Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Applications"
            value={stats.totalApps}
            icon={Activity}
            color="#3b82f6"
            subtitle="Active monitoring"
          />
          <StatCard
            title="Vulnerabilities"
            value={stats.totalVulnerabilities}
            icon={AlertTriangle}
            color="#ef4444"
            subtitle="Total discovered"
          />
          <StatCard
            title="Critical"
            value={stats.criticalVulnerabilities}
            icon={AlertTriangle}
            color="#dc2626"
            subtitle="Requires attention"
          />
          <StatCard
            title="High Priority"
            value={stats.highVulnerabilities}
            icon={TrendingUp}
            color="#f59e0b"
            subtitle="Review recommended"
          />
        </div>

        {/* Severity Distribution - Refined */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] transition-all duration-300">
          <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">
            Severity Distribution
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Critical', value: stats.criticalVulnerabilities, color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400' },
              { label: 'High', value: stats.highVulnerabilities, color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400' },
              { label: 'Medium', value: stats.mediumVulnerabilities, color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
              { label: 'Low', value: stats.lowVulnerabilities, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' }
            ].map(({ label, value, color, border, text }) => (
              <div key={label} className={`relative bg-gradient-to-br ${color} backdrop-blur-sm border ${border} rounded-lg p-5 text-center hover:scale-105 transition-transform duration-200`}>
                <p className={`text-3xl font-bold ${text} mb-1`}>{value}</p>
                <p className={`text-xs font-medium ${text} uppercase tracking-wide opacity-80`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Vulnerabilities - Sleek List */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Recent Vulnerabilities
            </h2>
            {loadingVulnerabilities && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Loader2 className="animate-spin" size={14} />
                <span className="font-light">Scanning...</span>
              </div>
            )}
          </div>
          
          {loadingVulnerabilities ? (
            <div className="text-center py-16">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
              <p className="text-slate-400 font-light">Searching NIST database</p>
            </div>
          ) : recentVulnerabilities.length > 0 ? (
            <div className="space-y-3">
              {recentVulnerabilities.map((vuln) => {
                const getSeverityStyles = (severity: string) => {
                  switch (severity) {
                    case 'CRITICAL':
                      return { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: 'text-red-500' };
                    case 'HIGH':
                      return { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: 'text-orange-500' };
                    case 'MEDIUM':
                      return { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: 'text-yellow-500' };
                    case 'LOW':
                      return { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: 'text-blue-500' };
                    default:
                      return { badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: 'text-slate-500' };
                  }
                };

                const styles = getSeverityStyles(vuln.severity);

                return (
                  <div
                    key={vuln.id}
                    className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${styles.icon}`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm mb-1">{vuln.cveId}</p>
                        <p className="text-xs text-slate-400 font-light line-clamp-1">
                          {vuln.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`ml-4 px-3 py-1 rounded-md text-xs font-medium border ${styles.badge} whitespace-nowrap`}
                    >
                      {vuln.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-400" size={24} />
              </div>
              <p className="text-slate-400 font-light">No vulnerabilities detected</p>
              <p className="text-xs text-slate-500 mt-2">Your applications are secure</p>
            </div>
          )}
        </div>

        {/* Quick Actions - Minimal Card */}
        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">
            Recommended Actions
          </h3>
          <ul className="space-y-3">
            {[
              'Review and acknowledge critical vulnerabilities',
              'Update affected applications to secure versions',
              'Configure automatic alerts for new threats',
              'Export vulnerability report for compliance'
            ].map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-200 font-light group">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 group-hover:scale-150 transition-transform duration-200"></span>
                <span className="group-hover:text-blue-100 transition-colors duration-200">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

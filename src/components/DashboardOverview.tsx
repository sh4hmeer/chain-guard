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
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} />
          <h1 className="text-3xl font-bold">ChainGuard Security Dashboard</h1>
        </div>
        <p className="text-blue-100">
          Proactive Supply Chain Attack Monitoring
        </p>
        <p className="text-sm text-blue-200 mt-2">
          "Know when your apps turn against you."
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={stats.totalApps}
          icon={Activity}
          color="#3b82f6"
          subtitle="Under monitoring"
        />
        <StatCard
          title="Total Vulnerabilities"
          value={stats.totalVulnerabilities}
          icon={AlertTriangle}
          color="#ef4444"
          subtitle="Active threats"
        />
        <StatCard
          title="Critical Issues"
          value={stats.criticalVulnerabilities}
          icon={AlertTriangle}
          color="#dc2626"
          subtitle="Immediate action required"
        />
        <StatCard
          title="High Priority"
          value={stats.highVulnerabilities}
          icon={TrendingUp}
          color="#f59e0b"
          subtitle="Review soon"
        />
      </div>

      {/* Severity Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Vulnerability Severity Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-3xl font-bold text-red-700">
              {stats.criticalVulnerabilities}
            </p>
            <p className="text-sm text-red-600 font-medium mt-1">Critical</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-3xl font-bold text-orange-700">
              {stats.highVulnerabilities}
            </p>
            <p className="text-sm text-orange-600 font-medium mt-1">High</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-3xl font-bold text-yellow-700">
              {stats.mediumVulnerabilities}
            </p>
            <p className="text-sm text-yellow-600 font-medium mt-1">Medium</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-700">
              {stats.lowVulnerabilities}
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">Low</p>
          </div>
        </div>
      </div>

      {/* Recent Vulnerabilities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Recent Vulnerabilities from NIST NVD
          </h3>
          {loadingVulnerabilities && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="animate-spin" size={16} />
              <span>Scanning for live vulnerabilities...</span>
            </div>
          )}
        </div>
        
        {loadingVulnerabilities ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
            <p className="text-gray-600">Searching NIST National Vulnerability Database...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a moment as we scan for CVEs</p>
          </div>
        ) : recentVulnerabilities.length > 0 ? (
          <div className="space-y-3">
            {recentVulnerabilities.map((vuln) => {
              const getSeverityColor = (severity: string) => {
                switch (severity) {
                  case 'CRITICAL':
                    return 'text-red-700 bg-red-100';
                  case 'HIGH':
                    return 'text-orange-700 bg-orange-100';
                  case 'MEDIUM':
                    return 'text-yellow-700 bg-yellow-100';
                  case 'LOW':
                    return 'text-blue-700 bg-blue-100';
                  default:
                    return 'text-gray-700 bg-gray-100';
                }
              };

              return (
                <div
                  key={vuln.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <AlertTriangle
                      size={20}
                      className={vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{vuln.cveId}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {vuln.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                      vuln.severity
                    )}`}
                  >
                    {vuln.severity}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="text-gray-600">No vulnerabilities found</p>
            <p className="text-xs text-gray-500 mt-1">Your applications appear to be secure</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Quick Actions
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Review and acknowledge all critical vulnerabilities
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Update affected applications to latest secure versions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Configure automatic alerts for new vulnerabilities
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Export vulnerability report for compliance team
          </li>
        </ul>
      </div>
    </div>
  );
};

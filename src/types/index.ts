export interface Application {
  id: string;
  name: string;
  vendor: string;
  version?: string;
  category?: string;
  addedDate: string;
}

export interface Vulnerability {
  id: string;
  cveId: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore?: number;
  affectedApps: string[];
  publishedDate: string;
  lastModifiedDate?: string;
  references?: string[];
  status: 'active' | 'mitigated' | 'acknowledged';
}

export interface CVEData {
  id: string;
  sourceIdentifier?: string;
  published: string;
  lastModified: string;
  vulnStatus?: string;
  descriptions: Array<{
    lang: string;
    value: string;
  }>;
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: {
        baseScore: number;
        baseSeverity: string;
      };
    }>;
  };
  references?: Array<{
    url: string;
    source?: string;
  }>;
}

export interface DashboardStats {
  totalApps: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  vulnerabilityId: string;
  appIds: string[];
  read: boolean;
}

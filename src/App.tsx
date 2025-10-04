import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppInventory } from './components/AppInventory';
import { VulnerabilityList } from './components/VulnerabilityList';
import { DashboardOverview } from './components/DashboardOverview';
import { Application, Vulnerability, DashboardStats } from './types';
import { getMockData, matchVulnerabilitiesToApps } from './services/vulnerabilityService';
import { applicationApi } from './services/apiService';
import { LayoutDashboard, Package, AlertTriangle, Menu, X } from 'lucide-react';

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // Check API connection and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if API is available
        await applicationApi.healthCheck();
        setApiConnected(true);
        
        // Load applications from MongoDB
        const apps = await applicationApi.getAll();
        
        if (apps.length === 0) {
          // If no apps in database, load mock data
          const mockData = getMockData([]);
          setVulnerabilities(mockData.vulnerabilities);
          setApplications([]);
        } else {
          setApplications(apps);
          const mockData = getMockData(apps);
          setVulnerabilities(mockData.vulnerabilities);
        }
      } catch (error) {
        console.error('API not available, using mock data:', error);
        setApiConnected(false);
        // Fallback to mock data
        const mockData = getMockData([]);
        setApplications(mockData.applications);
        setVulnerabilities(mockData.vulnerabilities);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Re-match vulnerabilities when applications change
  useEffect(() => {
    if (applications.length > 0 && vulnerabilities.length > 0) {
      const matched = matchVulnerabilitiesToApps(vulnerabilities, applications);
      setVulnerabilities(matched);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications.length]);

  const handleAddApplication = async (app: Omit<Application, 'id' | 'addedDate'>) => {
    try {
      if (apiConnected) {
        const newApp = await applicationApi.create(app);
        setApplications([...applications, newApp]);
      } else {
        // Fallback to local state
        const newApp: Application = {
          ...app,
          id: `app-${Date.now()}`,
          addedDate: new Date().toISOString()
        };
        setApplications([...applications, newApp]);
      }
    } catch (error) {
      console.error('Error adding application:', error);
      alert('Failed to add application. Please try again.');
    }
  };

  const handleRemoveApplication = async (id: string) => {
    try {
      if (apiConnected) {
        await applicationApi.delete(id);
      }
      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      console.error('Error removing application:', error);
      alert('Failed to remove application. Please try again.');
    }
  };

  const handleImportApps = async (apps: Application[]) => {
    try {
      if (apiConnected) {
        const newApps = await applicationApi.bulkCreate(apps);
        setApplications([...applications, ...newApps]);
      } else {
        // Fallback to local state
        setApplications([...applications, ...apps]);
      }
    } catch (error) {
      console.error('Error importing applications:', error);
      alert('Failed to import applications. Please try again.');
    }
  };

  const handleUpdateVulnerabilityStatus = (id: string, status: Vulnerability['status']) => {
    setVulnerabilities(
      vulnerabilities.map(vuln =>
        vuln.id === id ? { ...vuln, status } : vuln
      )
    );
  };

  const calculateStats = (): DashboardStats => {
    return {
      totalApps: applications.length,
      totalVulnerabilities: vulnerabilities.length,
      criticalVulnerabilities: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      highVulnerabilities: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      mediumVulnerabilities: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      lowVulnerabilities: vulnerabilities.filter(v => v.severity === 'LOW').length,
    };
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          apiConnected={apiConnected}
        />
        
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ChainGuard...</p>
            </div>
          </div>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardOverview
                    stats={calculateStats()}
                    vulnerabilities={vulnerabilities}
                  />
                }
              />
              <Route
                path="/applications"
                element={
                  <AppInventory
                    applications={applications}
                    onAddApplication={handleAddApplication}
                    onRemoveApplication={handleRemoveApplication}
                    onImportApps={handleImportApps}
                  />
                }
              />
              <Route
                path="/vulnerabilities"
                element={
                  <VulnerabilityList
                    vulnerabilities={vulnerabilities}
                    applications={applications}
                    onUpdateStatus={handleUpdateVulnerabilityStatus}
                  />
                }
              />
            </Routes>
          </main>
        )}
      </div>
    </Router>
  );
}

function Navigation({ mobileMenuOpen, setMobileMenuOpen, apiConnected }: { 
  mobileMenuOpen: boolean; 
  setMobileMenuOpen: (open: boolean) => void;
  apiConnected: boolean;
}) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/applications', label: 'Applications', icon: Package },
    { path: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">ChainGuard</span>
            </Link>
            {apiConnected && (
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                MongoDB Connected
              </span>
            )}
            {!apiConnected && (
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                Offline Mode
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default App;


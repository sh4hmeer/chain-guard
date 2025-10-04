import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppInventory } from './components/AppInventory';
import { VulnerabilityList } from './components/VulnerabilityList';
import { DashboardOverview } from './components/DashboardOverview';
import { AccountView } from './components/AccountView';
import { AuthCallback } from './components/AuthCallback';
import { Application, Vulnerability, DashboardStats } from './types';
import { getMockData, getVulnerabilities } from './services/vulnerabilityService';
import { applicationApi } from './services/apiService';
import { LayoutDashboard, Package, AlertTriangle, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { setAuthTokenProvider } from './services/apiService';

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [loadingVulnerabilities, setLoadingVulnerabilities] = useState(false);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Check API connection and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // public
        await applicationApi.healthCheck();
        setApiConnected(true);
  
        if (isAuthenticated) {
          // protected
          const apps = await applicationApi.getAll();
          setApplications(apps);
          
          // Fetch live vulnerabilities from NIST NVD
          setLoadingVulnerabilities(true);
          try {
            const vulns = await getVulnerabilities(apps, true);
            setVulnerabilities(vulns);
          } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
            // Fallback to mock data
            const mock = getMockData(apps);
            setVulnerabilities(mock.vulnerabilities);
          } finally {
            setLoadingVulnerabilities(false);
          }
        } else {
          // not logged in → demo mode with mock data
          const mock = getMockData([]);
          setApplications(mock.applications);
          setVulnerabilities(mock.vulnerabilities);
        }
      } catch (err) {
        console.error('API not available, using mock data:', err);
        setApiConnected(false);
        const mock = getMockData([]);
        setApplications(mock.applications);
        setVulnerabilities(mock.vulnerabilities);
      } finally {
        setLoading(false);
      }
    };
  
    initializeData();
  }, [isAuthenticated]);

  // Re-fetch vulnerabilities when applications change
  useEffect(() => {
    const refetchVulnerabilities = async () => {
      if (applications.length > 0 && isAuthenticated) {
        setLoadingVulnerabilities(true);
        try {
          const vulns = await getVulnerabilities(applications, true);
          setVulnerabilities(vulns);
        } catch (error) {
          console.error('Error re-fetching vulnerabilities:', error);
        } finally {
          setLoadingVulnerabilities(false);
        }
      }
    };

    refetchVulnerabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications.length, isAuthenticated]);

  useEffect(() => {
    setAuthTokenProvider(async () => {
      if (!isAuthenticated) return null;
      return await getAccessTokenSilently(); // audience comes from Auth0Provider
    });
  }, [isAuthenticated, getAccessTokenSilently]);
      

  const Protect = ({ Comp }: { Comp: React.ComponentType }) => {
    const Protected = withAuthenticationRequired(Comp, {
      onRedirecting: () => <div>Checking auth…</div>,
    });
    return <Protected />;
  };

  const handleAddApplication = async (app: Omit<Application, 'id' | 'addedDate'>) => {
    try {
      console.log('🎬 App.tsx: handleAddApplication called with:', app);
      console.log('🔌 App.tsx: API Connected:', apiConnected);
      
      if (apiConnected) {
        console.log('📡 App.tsx: Calling API to create application...');
        const newApp = await applicationApi.create(app);
        console.log('✅ App.tsx: API returned new app:', newApp);
        console.log('📋 App.tsx: Current applications count:', applications.length);
        
        setApplications([...applications, newApp]);
        console.log('✨ App.tsx: State updated with new application');
      } else {
        console.log('⚠️  App.tsx: API not connected, using local fallback');
        // Fallback to local state
        const newApp: Application = {
          ...app,
          id: `app-${Date.now()}`,
          addedDate: new Date().toISOString()
        };
        setApplications([...applications, newApp]);
      }
    } catch (error) {
      console.error('❌ App.tsx: Error adding application:', error);
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
                    loadingVulnerabilities={loadingVulnerabilities}
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
              <Route 
                path="/callback"
                element={<AuthCallback />}
              />
              <Route
                path="/account"
                element={
                  <Protect
                    Comp={() => <AccountView />}
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
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);
  
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
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.name || user.email || 'User'}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User size={16} />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout({ logoutParams: { returnTo: window.location.origin } });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <LogIn size={18} />
                Sign In
              </button>
            )}
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
            
            {/* Mobile User Menu */}
            {isAuthenticated && user ? (
              <>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={18} />
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout({ logoutParams: { returnTo: window.location.origin } });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    loginWithRedirect();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default App;
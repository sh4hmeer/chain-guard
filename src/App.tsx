import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppInventory } from './components/AppInventory';
import { VulnerabilityList } from './components/VulnerabilityList';
import { DashboardOverview } from './components/DashboardOverview';
import { AccountView } from './components/AccountView';
import { AuthCallback } from './components/AuthCallback';
import SecurityFeed from './components/SecurityFeed';
import { Application, Vulnerability, DashboardStats } from './types';
import { getMockData, getVulnerabilities } from './services/vulnerabilityService';
import { applicationApi } from './services/apiService';
import { LayoutDashboard, Package, AlertTriangle, Menu, X, User, LogOut, LogIn, Shield } from 'lucide-react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { setAuthTokenProvider } from './services/apiService';
import { LandingPage } from './components/LandingPage';
import VantaBackground from './components/VantaBackground';

  // Shows Vanta only on landing page (/)
  function LandingVanta() {
    const { pathname } = useLocation();
    if (pathname !== '/') return null;
    return <VantaBackground />;
  }

  // Switches outer bg so Vanta is visible on landing page, adds backdrop effects
  function BgSwitcher({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();
    const isLanding = pathname === '/';
    
    return (
      <div className={`min-h-screen ${isLanding ? 'bg-transparent' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950'}`}>
        {/* Animated gradient orbs for non-landing pages */}
        {!isLanding && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Top right orb */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '8s' }} />
            {/* Bottom left orb */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '10s', animationDelay: '2s' }} />
            {/* Center accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '12s', animationDelay: '4s' }} />
          </div>
        )}
        {children}
      </div>
    );
  }

  // Redirect authenticated users from landing page to dashboard
  function LandingPageOrRedirect() {
    const { isAuthenticated, isLoading } = useAuth0();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <LandingPage />;
  }

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [loadingVulnerabilities, setLoadingVulnerabilities] = useState(false);
  const { getAccessTokenSilently, isAuthenticated, user} = useAuth0();

  // Check API connection and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Public health check
        await applicationApi.healthCheck();
        setApiConnected(true);
  
        if (isAuthenticated) {
          // Fetch protected user data
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
          // Not logged in → demo mode with mock data
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
  }, [isAuthenticated]); // Only re-run when authentication status changes



  // Re-fetch vulnerabilities when applications are manually added/removed
  // (not on initial load, which is handled by initializeData)
  const applicationsRef = useRef<Application[]>(applications);
  useEffect(() => {
    // Skip if this is the first render or applications are empty
    if (applicationsRef.current.length === 0 || !isAuthenticated) {
      applicationsRef.current = applications;
      return;
    }

    // Only refetch if the number of applications actually changed
    if (applicationsRef.current.length !== applications.length) {
      const refetchVulnerabilities = async () => {
        setLoadingVulnerabilities(true);
        try {
          const vulns = await getVulnerabilities(applications, true);
          setVulnerabilities(vulns);
        } catch (error) {
          console.error('Error re-fetching vulnerabilities:', error);
        } finally {
          setLoadingVulnerabilities(false);
        }
      };

      refetchVulnerabilities();
      applicationsRef.current = applications;
    }
  }, [applications, isAuthenticated]);

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
      console.log('👤 App.tsx: User authenticated:', isAuthenticated, 'User ID:', user?.sub);

      // Only use API if connected AND user is authenticated with a valid user ID
      if (apiConnected && isAuthenticated && user?.sub) {
        console.log('📡 App.tsx: Calling API to create application...');
        const newApp = await applicationApi.create(app, user.sub);
        console.log('✅ App.tsx: API returned new app:', newApp);
        console.log('📋 App.tsx: Current applications count:', applications.length);
        
        setApplications([...applications, newApp]);
        console.log('✨ App.tsx: State updated with new application');
      } else {
        console.log('⚠️  App.tsx: Using local fallback (API connected:', apiConnected, ', Authenticated:', isAuthenticated, ')');
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
      <BgSwitcher>
      <LandingVanta />   {/* full-page background on landing page only */}
      <div className="min-h-screen relative">
          {isAuthenticated && (
          <Navigation
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen}
            apiConnected={apiConnected}
          />
        )}

        
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative">
                {/* Outer spinning ring */}
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-500/20 border-t-blue-500 mx-auto mb-4 shadow-lg shadow-blue-500/20"></div>
                {/* Inner pulsing glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-slate-300 font-light">Loading ChainGuardia...</p>
            </div>
          </div>
        ) : (
          <main className="relative">
            <Routes>
              <Route path="/" element={<LandingPageOrRedirect />} />

              <Route
                path="/dashboard"
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
                  />
                }
              />
              <Route
                path="/security-feed"
                element={<SecurityFeed />}
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
      </BgSwitcher>
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the button container AND the dropdown
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };
    
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/applications', label: 'Applications', icon: Package },
    { path: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
    { path: '/security-feed', label: 'Security Feed', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="relative bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-blue-500/10">
      {/* Subtle animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" 
           style={{ animationDuration: '3s' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105">
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                <Shield className="relative text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                ChainGuardia
              </span>
            </Link>
            {apiConnected && (
              <span className="ml-3 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-xs rounded-full font-semibold flex items-center gap-1.5 animate-in fade-in duration-500">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online
              </span>
            )}
            {!apiConnected && (
              <span className="ml-3 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                Offline Mode
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {isActive(path) && (
                  <div className="absolute inset-0 rounded-lg bg-blue-400/10 animate-pulse" style={{ animationDuration: '2s' }} />
                )}
                <Icon size={18} className={`relative transition-transform duration-200 ${isActive(path) ? '' : 'group-hover:scale-110'}`} />
                <span className="relative font-medium">{label}</span>
              </Link>
            ))}
            
            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors duration-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                    {user.name || user.email || 'User'}
                  </span>
                </button>
                
                {/* Render dropdown using Portal to escape nav container */}
                {userMenuOpen && createPortal(
                  <div 
                    ref={dropdownRef}
                    className="fixed w-64 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2"
                    style={{ 
                      top: '4rem',
                      right: '1rem',
                      zIndex: 99999,
                      position: 'fixed',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User size={16} />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout({ logoutParams: { returnTo: window.location.origin } });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="group relative ml-2 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <LogIn size={18} className="relative" />
                <span className="relative">Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            
            {/* Mobile User Menu */}
            {isAuthenticated && user ? (
              <>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="px-3 py-3 bg-white/5 rounded-lg mx-2 mb-2">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || 'User'}
                          className="w-10 h-10 rounded-full border-2 border-blue-500/50 shadow-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 transition-all duration-200"
                  >
                    <User size={18} />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout({ logoutParams: { returnTo: window.location.origin } });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-white/10 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    loginWithRedirect();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30"
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
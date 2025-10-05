import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AlertCircle } from 'lucide-react';

export function AuthCallback() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error('Authentication error:', error);
        // Redirect to home page on error
        navigate('/');
      } else if (isAuthenticated) {
        // Authenticated, redirect to home
        const returnTo = sessionStorage.getItem('returnTo') || '/';
        sessionStorage.removeItem('returnTo');
        navigate(returnTo);
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Authentication Error</h2>
          <p className="text-slate-400 font-light mb-6">{error.message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 font-medium hover:scale-105"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="text-center">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-500/20 border-t-blue-500 mx-auto mb-4 shadow-lg shadow-blue-500/20"></div>
          {/* Inner pulsing glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Signing you in...</h2>
        <p className="text-slate-400 font-light">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
}

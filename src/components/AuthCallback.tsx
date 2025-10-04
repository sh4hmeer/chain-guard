import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
}

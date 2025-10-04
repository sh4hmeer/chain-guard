import { useAuth0 } from '@auth0/auth0-react';
import { User, Mail, Shield, Calendar, LogOut, Settings } from 'lucide-react';

export function AccountView() {
  const { user, isAuthenticated, logout } = useAuth0();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-blue-500 flex items-center justify-center">
                <User size={48} className="text-white" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{user.name || 'User'}</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Mail size={16} />
              {user.email || 'No email provided'}
            </p>
            {user.email_verified && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                <Shield size={14} />
                Verified Account
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Account Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <code className="text-xs text-gray-800 break-all">{user.sub}</code>
              </div>
            </div>

            {/* Nickname */}
            {user.nickname && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nickname</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800">{user.nickname}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                <p className="text-gray-800">{user.email || 'Not provided'}</p>
                {user.email_verified ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Last Updated */}
            {user.updated_at && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Last Updated
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800">{formatDate(user.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Metadata */}
          {Object.keys(user).length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Profile Data
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Actions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} />
            Security & Session
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h3 className="font-semibold text-gray-900">Active Session</h3>
                <p className="text-sm text-gray-600">You are currently signed in</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {user.email_verified ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-700 mt-1">Email Status</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {user.sub?.split('|')[0] || 'auth'}
            </div>
            <div className="text-sm text-gray-700 mt-1">Auth Provider</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {formatDate(user.updated_at).split(',')[0]}
            </div>
            <div className="text-sm text-gray-700 mt-1">Last Activity</div>
          </div>
        </div>
      </div>
    </div>
  );
}

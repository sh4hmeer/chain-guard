import { useAuth0 } from '@auth0/auth0-react';
import { User, Mail, Shield, Calendar, LogOut, Settings, CheckCircle } from 'lucide-react';

export function AccountView() {
  const { user, isAuthenticated, logout } = useAuth0();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-8 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center mx-auto mb-6">
            <User size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Not Authenticated</h2>
          <p className="text-slate-400 font-light">Please log in to view your account</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-400 font-light">
            Manage your profile and security preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8 shadow-xl shadow-blue-500/10">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative flex items-center gap-8">
            <div className="relative">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-28 h-28 rounded-2xl border-4 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl border-4 border-white/20 shadow-2xl bg-blue-500/30 flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
              {/* Subtle online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-950 shadow-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{user.name || 'User'}</h2>
              <p className="text-blue-200 font-light flex items-center gap-2 mb-3">
                <Mail size={18} />
                {user.email || 'No email provided'}
              </p>
              {user.email_verified && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg font-semibold text-sm">
                  <CheckCircle size={16} />
                  Verified Account
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 border-b border-white/10 px-6 py-4">
            <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Settings size={20} />
              Account Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">User ID</label>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <code className="text-xs text-slate-300 break-all font-light">{user.sub}</code>
                </div>
              </div>

              {/* Nickname */}
              {user.nickname && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Nickname</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-slate-300 font-light">{user.nickname}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <p className="text-slate-300 font-light">{user.email || 'Not provided'}</p>
                  {user.email_verified ? (
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-xs font-semibold">
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs font-semibold">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              {user.updated_at && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Last Updated
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-slate-300 font-light">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & Session */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 border-b border-white/10 px-6 py-4">
            <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Shield size={20} />
              Security & Session
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <h4 className="font-semibold text-white mb-1">Active Session</h4>
                  <p className="text-sm text-slate-400 font-light">You are currently signed in</p>
                </div>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </div>

              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/20 hover:border-red-400/50 hover:scale-[1.02] transition-all duration-200 font-semibold shadow-lg shadow-red-500/10"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 tracking-tight">Account Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-blue-700/5 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-transform duration-200">
              <div className="text-4xl font-bold text-blue-300 mb-2">
                {user.email_verified ? '✓' : '○'}
              </div>
              <div className="text-sm text-slate-300 font-light">Email Status</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 via-green-600/10 to-green-700/5 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-green-300 mb-2 uppercase">
                {user.sub?.split('|')[0] || 'auth'}
              </div>
              <div className="text-sm text-slate-300 font-light">Auth Provider</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-purple-700/5 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-transform duration-200">
              <div className="text-2xl font-bold text-purple-300 mb-2">
                {formatDate(user.updated_at).split(',')[0]}
              </div>
              <div className="text-sm text-slate-300 font-light">Last Activity</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

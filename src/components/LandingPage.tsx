import { useAuth0 } from '@auth0/auth0-react';
import { Shield } from 'lucide-react';

export function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const handleStart = () => {
    loginWithRedirect();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Minimal header - clean and refined */}
      <header className="relative z-20 flex items-center justify-start px-8 py-6">
        <div className="flex items-center gap-2.5 text-white/90">
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-lg bg-blue-400/20 animate-ping" style={{ animationDuration: '2s' }} />
            <Shield className="relative text-white" size={20} />
          </div>
          <span className="text-sm font-medium tracking-wide">ChainGuardia</span>
        </div>
      </header>

      {/* HERO SECTION - sleek, secure, minimal */}
      <main className="relative flex-1 flex items-center justify-center">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Company name front and center - bold statement */}
          <h1 className="text-7xl sm:text-8xl font-bold tracking-tight text-white mb-8">
            ChainGuardia
          </h1>
          
          {/* Minimal refined tagline */}
          <p className="text-lg text-slate-300 font-light tracking-wide mb-12">
            Security intelligence, simplified.
          </p>

          <button
            onClick={handleStart}
            className="px-12 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 active:scale-95 transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-500/40 ring-2 ring-blue-500/50 hover:ring-blue-400/60"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>

          {/* Minimal feature cards - refined spacing */}
          <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3 mx-auto">
            {[
              ['1. Add Applications', 'List tools and services'],
              ['2. View Vulnerabilities', 'Threats exposed and summarized'],
              ['3. Explore Insights', 'Concepts explained simply.'],
              

            ].map(([title, desc]) => (
              <div key={title} className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-light">
        © 2025 ChainGuardia
      </footer>
    </div>
  );
}
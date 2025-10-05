import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      loginWithRedirect();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Minimal header - clean and refined */}
      <header className="relative z-20 flex items-center justify-start px-8 py-6">
        <div className="flex items-center gap-2.5 text-white/90">
          <img src="/vite.svg" alt="logo" className="h-5 w-5" />
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
            className="px-10 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>

          {/* Minimal feature cards - refined spacing */}
          <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3 mx-auto">
            {[
              ['1.Add Applications', 'List tools and services'],
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
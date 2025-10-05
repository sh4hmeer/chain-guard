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
      {/* HEADER (Logo only) - elevated above background */}
      <header className="relative z-20 flex items-center justify-start px-6 py-5">
        <div className="flex items-center gap-2 text-white">
          <img src="/vite.svg" alt="logo" className="h-6 w-6 drop-shadow-lg" />
          <span className="text-lg font-semibold drop-shadow-lg">ChainGuard</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative flex-1">

        {/* content above the background, perfectly centered */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl text-white drop-shadow-2xl">
            Stop Supply Chain Attacks Before They Spread
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-blue-100 drop-shadow-lg">
            Bridge the gap between cybersecurity experts and IT teams. Understand vulnerabilities in plain language.
          </p>

          <button
            onClick={handleStart}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-2xl hover:bg-blue-500 hover:scale-105 transition-all duration-200 ring-2 ring-blue-400/50"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>

          {/* Feature Cards - Simple 3-Step Process */}
          <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3 mx-auto">
            {[
              ['1. Add Your Applications', 'Simply list the software your team uses. No technical setup required.'],
              ['2. View Vulnerabilities', 'See security issues explained in clear, everyday language.'],
              ['3. Explore Insights', 'Get actionable recommendations anyone can understand and act on.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-blue-400/20 bg-slate-900/60 backdrop-blur-md p-6 shadow-2xl hover:bg-slate-900/80 transition-all duration-200 hover:border-blue-400/40">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-blue-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-blue-900/30 bg-slate-950/80 backdrop-blur-sm py-4 text-center text-sm text-blue-300">
        © 2025 ChainGuard — Secure your software supply chain
      </footer>
    </div>
  );
}
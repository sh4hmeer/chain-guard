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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* HEADER (Logo only) */}
      <header className="flex items-center justify-start px-6 py-5">
        <div className="flex items-center gap-2">
          <img src="/vite.svg" alt="logo" className="h-6 w-6" />
          <span className="text-lg font-semibold">ChainGuard</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative flex-1">

        {/* content above the background, perfectly centered */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Stop Supply Chain Attacks Before They Spread
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Monitor, analyze, and respond to vulnerabilities across your company’s software stack — all in one dashboard.
          </p>

          <button
            onClick={handleStart}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-blue-700 transition"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>

          {/* Feature Cards */}
          <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3 mx-auto">
            {[
              ['Live Vulnerability Tracking', 'Pulls data directly from NIST NVD and vendor advisories.'],
              ['Centralized Inventory', 'Monitor all approved and shadow applications.'],
              ['Proactive Alerts', 'Catch vulnerabilities before they affect production.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
        © 2025 ChainGuard — Secure your software supply chain
      </footer>
    </div>
  );
}
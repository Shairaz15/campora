import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-black text-sm">
            C
          </div>
          <span className="text-xl font-bold neon-text">Campora</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="page-enter max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-sm font-medium mb-8">
            <span className="pulse-dot"></span>
            Exclusively for .edu verified students
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.08)_0%,transparent_70%)] pointer-events-none" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight relative">
              Your Campus,{' '}
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Your Economy
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Buy, sell, swap, and connect — all within your verified campus community.
            Zero fees. Zero middlemen. 100% student-powered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="btn-primary text-base px-8 py-3 w-full sm:w-auto text-center">
              Join Your Campus →
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto text-center">
              Sign In
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="card p-5 text-left">
              <div className="text-2xl mb-2">🛍️</div>
              <h3 className="font-semibold mb-1">Marketplace</h3>
              <p className="text-sm text-[var(--text-secondary)]">Buy & sell within campus</p>
            </div>
            <div className="card p-5 text-left">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="font-semibold mb-1">Swap System</h3>
              <p className="text-sm text-[var(--text-secondary)]">Trade items peer-to-peer</p>
            </div>
            <div className="card p-5 text-left">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold mb-1">Escrow Safety</h3>
              <p className="text-sm text-[var(--text-secondary)]">Admin-verified transactions</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[var(--text-secondary)]">
        Built for students, by students. © 2026 Campora
      </footer>
    </div>
  );
}

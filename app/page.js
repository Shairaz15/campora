import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-[#1a1a1d]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-sm tracking-tight">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Campora</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#A1A1AA] hover:text-white transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/login" className="btn-primary text-sm px-6">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
        {/* Subtle red radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="page-enter max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#222] bg-[#111113] text-[#A1A1AA] text-sm font-medium mb-12 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Exclusively for verified students
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tight">
            Your Campus.
            <br />
            <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Your Economy.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#71717A] mb-14 max-w-xl mx-auto leading-relaxed font-light">
            Buy, sell, swap & connect — within your verified campus community.
            Zero fees. Zero middlemen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link href="/login" className="group relative bg-red-600 hover:bg-red-700 text-white font-bold text-base px-10 py-4 rounded-xl transition-all duration-200 w-full sm:w-auto text-center shadow-[0_0_0_0_rgba(225,6,0,0)] hover:shadow-[0_8px_32px_rgba(225,6,0,0.25)] hover:-translate-y-0.5">
              Enter Marketplace →
            </Link>
            <Link href="/login" className="text-[#A1A1AA] hover:text-white text-base px-10 py-4 rounded-xl border border-[#222] hover:border-[#333] transition-all duration-200 w-full sm:w-auto text-center font-medium">
              Sign In
            </Link>
          </div>

          {/* Feature strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: '🛍️', title: 'Marketplace', desc: 'Buy & sell within your campus network' },
              { icon: '🔄', title: 'Swap System', desc: 'Trade items peer-to-peer, no cash needed' },
              { icon: '🛡️', title: 'Escrow Safety', desc: 'Admin-verified secure transactions' },
            ].map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-[#111113] border border-[#1c1c1f] hover:border-red-900/30 transition-all duration-200 text-left">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-1.5 text-base">{f.title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#52525B] tracking-wide border-t border-[#111]">
        CAMPORA © 2026 — Built for students, by students.
      </footer>
    </div>
  );
}

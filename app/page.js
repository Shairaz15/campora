import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col overflow-hidden">
      {/* Minimal Nav — no logo */}
      <nav className="flex items-center justify-end px-8 md:px-16 py-5">
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#71717A] hover:text-white transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all duration-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Red radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="page-enter max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#1c1c1f] bg-[#111113] text-[#71717A] text-xs font-medium mb-16 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Verified Students Only
          </div>

          <h1 className="text-7xl md:text-[7rem] font-black mb-8 leading-[0.95] tracking-tighter">
            Your Campus.
            <br />
            <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Your Economy.
            </span>
          </h1>

          <p className="text-lg text-[#52525B] mb-16 max-w-lg mx-auto leading-relaxed font-light">
            Buy, sell, swap & connect — within your verified campus community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-40">
            <Link href="/login" className="group bg-red-600 hover:bg-red-700 text-white font-bold text-base px-12 py-4 rounded-xl transition-all duration-200 w-full sm:w-auto text-center hover:shadow-[0_8px_40px_rgba(225,6,0,0.25)] hover:-translate-y-0.5">
              Enter Marketplace →
            </Link>
            <Link href="/login" className="text-[#71717A] hover:text-white text-base px-10 py-4 rounded-xl border border-[#1c1c1f] hover:border-[#333] transition-all duration-200 w-full sm:w-auto text-center font-medium">
              Sign In
            </Link>
          </div>

          {/* Uiverse-style glowing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto pb-20">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                ),
                title: 'Marketplace',
                desc: 'Buy & sell within your verified campus network',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                ),
                title: 'Swap System',
                desc: 'Trade items peer-to-peer with zero cash needed',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: 'Escrow Safety',
                desc: 'Admin-verified secure transactions every time',
              },
            ].map((f) => (
              <div key={f.title} className="landing-card group relative rounded-2xl p-[2px] overflow-visible">
                {/* Gradient border + blur glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-600 to-red-900 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-600 to-red-900 opacity-0 group-hover:opacity-0 blur-2xl scale-90 transition-all duration-500 -z-10 group-hover:blur-[30px] group-hover:opacity-40" style={{ top: '20px' }} />
                {/* Inner dark card */}
                <div className="relative rounded-[14px] bg-[#0e0e10] p-8 h-full flex flex-col items-center text-center transition-colors duration-500 group-hover:text-red-500">
                  <div className="mb-6 text-[#555] group-hover:text-red-500 transition-colors duration-500">{f.icon}</div>
                  <h3 className="font-bold text-white text-lg tracking-wide mb-2">{f.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#333] tracking-widest uppercase border-t border-[#111]">
        Campora © 2026
      </footer>
    </div>
  );
}

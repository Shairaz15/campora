'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, clearAuthCookie } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setUser(getCurrentUser());
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = () => {
        clearAuthCookie();
        router.push('/login');
    };

    const links = [
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/sell', label: 'Sell' },
        { href: '/chat', label: 'Chat' },
        { href: '/community', label: 'Community' },
        { href: '/profile', label: 'Profile' },
    ];

    if (user?.role === 'admin') {
        links.push({ href: '/admin', label: 'Admin' });
    }

    const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

    return (
        <nav className={`sticky top-0 z-50 bg-[#0B0B0D]/95 backdrop-blur-sm border-b transition-shadow duration-200 ${scrolled ? 'border-[rgba(255,255,255,0.08)] shadow-[0_1px_12px_rgba(0,0,0,0.4)]' : 'border-[rgba(255,255,255,0.04)]'}`}>
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/marketplace" className="text-sm font-bold tracking-[0.2em] text-white uppercase">
                    Campora
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative px-4 py-2 text-sm font-medium transition-colors group"
                        >
                            <span className={isActive(link.href) ? 'text-[#E10600]' : 'text-[#71717A] group-hover:text-white'}>
                                {link.label}
                            </span>
                            {/* Active / hover underline */}
                            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#E10600] rounded-full transition-all duration-200 ${isActive(link.href) ? 'w-5' : 'w-0 group-hover:w-5'}`} />
                        </Link>
                    ))}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#1c1c1f] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-xs font-semibold text-[#A1A1AA]">
                                {user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm text-[#A1A1AA]">{user.name}</span>
                            {user.role === 'admin' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#E10600]/20 text-[#E10600] font-medium tracking-wide uppercase">Admin</span>
                            )}
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
                    >
                        Sign Out
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-[#A1A1AA] hover:text-white transition-colors"
                    >
                        {menuOpen ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-[rgba(255,255,255,0.04)] px-6 py-3 space-y-1 bg-[#0B0B0D]">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                ? 'text-[#E10600]'
                                : 'text-[#71717A] hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

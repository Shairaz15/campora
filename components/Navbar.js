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

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const handleSignOut = () => {
        clearAuthCookie();
        router.push('/login');
    };

    const links = [
        { href: '/marketplace', label: '🛒 Marketplace' },
        { href: '/sell', label: '📦 Sell' },
        { href: '/chat', label: '💬 Chat' },
        { href: '/community', label: '🌐 Community' },
        { href: '/profile', label: '👤 Profile' },
    ];

    if (user?.role === 'admin') {
        links.push({ href: '/admin', label: '🛡️ Admin' });
    }

    return (
        <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border-color)]">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/marketplace" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-sm">
                        C
                    </div>
                    <span className="font-bold neon-text hidden sm:inline">Campora</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === link.href || pathname.startsWith(link.href + '/')
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User + Sign Out */}
                <div className="flex items-center gap-3">
                    {user && (
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-black">
                                {user.name?.[0] || '?'}
                            </div>
                            <span className="text-sm text-[var(--text-secondary)]">{user.name}</span>
                            {user.role === 'admin' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">Admin</span>
                            )}
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        Sign Out
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden text-xl"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-[var(--border-color)] px-4 py-2 space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm ${pathname === link.href
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-[var(--text-secondary)]'
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

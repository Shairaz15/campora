'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
                setProfile(data);
            }
        };
        getUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const navLinks = [
        { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
        { href: '/sell', label: 'Sell', icon: '➕' },
        { href: '/chat', label: 'Chat', icon: '💬' },
        { href: '/community', label: 'Community', icon: '🌐' },
        { href: '/profile', label: 'Profile', icon: '👤' },
    ];

    if (profile?.role === 'admin') {
        navLinks.push({ href: '/admin', label: 'Admin', icon: '🔐' });
    }

    return (
        <nav className="glass sticky top-0 z-50 border-b border-[var(--border-color)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/marketplace" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-sm">
                            C
                        </div>
                        <span className="text-lg font-bold neon-text hidden sm:block">Campora</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname.startsWith(link.href)
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="mr-1.5">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User menu */}
                    <div className="flex items-center gap-3">
                        {profile && (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                                    {profile.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-medium max-w-[100px] truncate">{profile.name}</span>
                                {profile.is_verified && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓</span>
                                )}
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/5"
                        >
                            Sign Out
                        </button>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-white p-2"
                            onClick={() => setMenuOpen(!menuOpen)}
                            id="mobile-menu-btn"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                {menuOpen ? (
                                    <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                ) : (
                                    <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden py-3 border-t border-[var(--border-color)]">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname.startsWith(link.href)
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

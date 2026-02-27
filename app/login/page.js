'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Check user profile and role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profile?.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/marketplace');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
            <div className="w-full max-w-md page-enter">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-lg">
                            C
                        </div>
                        <span className="text-2xl font-bold neon-text">Campora</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">Sign in to your campus marketplace</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    id="login-email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    id="login-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary w-full py-3 mt-6"
                            disabled={loading || !email || !password}
                            id="login-btn"
                        >
                            {loading ? <span className="spinner mx-auto"></span> : 'Sign In →'}
                        </button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-4 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs text-[var(--text-secondary)]">
                        <strong className="text-cyan-400">Demo Admin:</strong> admin@campora.edu / admin123
                    </div>
                </div>

                <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-cyan-400 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

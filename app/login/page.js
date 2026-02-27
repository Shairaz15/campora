'use client';

import { useState } from 'react';
import { validateLogin, setAuthCookie } from '@/lib/auth';
import { ADMIN_EMAIL } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const user = validateLogin(email, password);
        if (user) {
            setAuthCookie(user.id);
            router.push(user.role === 'admin' ? '/admin' : '/marketplace');
        } else {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    const handleDemoLogin = (email, password) => {
        setLoading(true);
        const user = validateLogin(email, password);
        if (user) {
            setAuthCookie(user.id);
            router.push(user.role === 'admin' ? '/admin' : '/marketplace');
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md page-enter">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-2xl shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                            C
                        </div>
                        <span className="text-3xl font-bold neon-text">Campora</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-lg">Sign in to your campus marketplace</p>
                </div>

                <div className="space-y-6">
                    {/* Manual Login Form */}
                    <div className="card p-6">
                        <form onSubmit={handleLogin}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
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
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Sign In →'}
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center gap-4 text-[var(--text-secondary)] text-sm">
                        <div className="flex-1 h-px bg-[var(--border-color)]"></div>
                        <span>OR TRY A DEMO ACCOUNT</span>
                        <div className="flex-1 h-px bg-[var(--border-color)]"></div>
                    </div>

                    {/* 1-Click Demo Buttons */}
                    <div className="card p-6 space-y-3">
                        <button
                            onClick={() => handleDemoLogin('shairaz102938@gmail.com', 'admin123')}
                            className="w-full p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <div className="font-bold text-cyan-400 flex items-center gap-2">🛡️ Log in as Admin</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5">shairaz102938@gmail.com</div>
                            </div>
                            <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>

                        <button
                            onClick={() => handleDemoLogin('suhaim10293847@gmail.com', 'student123')}
                            className="w-full p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <div className="font-bold text-purple-400 flex items-center gap-2">🎓 Log in as Student 1</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5">suhaim10293847@gmail.com</div>
                            </div>
                            <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>

                        <button
                            onClick={() => handleDemoLogin('sashank10293847@gmail.com', 'student123')}
                            className="w-full p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <div className="font-bold text-blue-400 flex items-center gap-2">🎓 Log in as Student 2</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-0.5">sashank10293847@gmail.com</div>
                            </div>
                            <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <span className="spinner scale-150"></span>
                    </div>
                )}
            </div>
        </div>
    );
}

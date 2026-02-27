'use client';

import { useState } from 'react';
import { validateLogin, setAuthCookie } from '@/lib/auth';
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

    const handleDemoLogin = (demoEmail, demoPassword) => {
        setLoading(true);
        setError('');
        const user = validateLogin(demoEmail, demoPassword);
        if (user) {
            setAuthCookie(user.id);
            router.push(user.role === 'admin' ? '/admin' : '/marketplace');
        } else {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_60%)] pointer-events-none" />

            <div className="w-full max-w-[520px] relative z-10">
                {/* Header */}
                <div className="text-center mb-14">
                    <h1 className="text-base font-bold tracking-[0.3em] text-white uppercase mb-5">
                        Campora
                    </h1>
                    <p className="text-[#A1A1AA] text-2xl font-medium tracking-tight">
                        Sign in to your campus account
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#141416] rounded-3xl border border-[#27272A] px-12 py-14 shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-[#71717A] mb-3">
                                Email address
                            </label>
                            <input
                                type="email"
                                className="w-full bg-[#0B0B0D] border border-[#27272A] rounded-xl px-5 py-5 text-base text-white placeholder-[#52525B] transition-all duration-150 outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/20"
                                placeholder="name@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-12">
                            <label className="block text-sm font-medium text-[#71717A] mb-3">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full bg-[#0B0B0D] border border-[#27272A] rounded-xl px-5 py-5 text-base text-white placeholder-[#52525B] transition-all duration-150 outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/20"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-[#E10600] mb-5">
                                {error}
                            </div>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#E10600] hover:bg-[#B80500] text-white text-lg font-semibold py-5 rounded-xl transition-all duration-150 hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(225,6,0,0.15)] hover:shadow-[0_6px_24px_rgba(225,6,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                            disabled={loading || !email || !password}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-12">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#27272A]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-[0.15em] font-semibold">
                            <span className="bg-[#141416] px-5 text-[#52525B]">or test accounts</span>
                        </div>
                    </div>

                    {/* Demo Accounts */}
                    <div className="flex flex-col items-center gap-5 text-[15px]">
                        <button
                            onClick={() => handleDemoLogin('shairaz102938@gmail.com', 'admin123')}
                            className="text-[#A1A1AA] hover:text-white transition-colors hover:underline underline-offset-4 decoration-[#E10600]/50"
                        >
                            Log in as Admin
                        </button>
                        <button
                            onClick={() => handleDemoLogin('suhaim10293847@gmail.com', 'student123')}
                            className="text-[#A1A1AA] hover:text-white transition-colors hover:underline underline-offset-4 decoration-[#E10600]/50"
                        >
                            Log in as Student 1
                        </button>
                        <button
                            onClick={() => handleDemoLogin('sashank10293847@gmail.com', 'student123')}
                            className="text-[#A1A1AA] hover:text-white transition-colors hover:underline underline-offset-4 decoration-[#E10600]/50"
                        >
                            Log in as Student 2
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

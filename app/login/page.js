'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_PHONE } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // phone | otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        const { error: authError } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        setPhone(formattedPhone);
        setStep('otp');
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (verifyError) {
            setError(verifyError.message);
            setLoading(false);
            return;
        }

        // Check if user profile exists, if not redirect to onboarding
        const { data: profile } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', data.user.id)
            .single();

        if (!profile) {
            router.push('/signup?onboard=true');
        } else if (profile.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/marketplace');
        }

        setLoading(false);
    };

    const isAdmin = phone === ADMIN_PHONE || phone === ADMIN_PHONE.replace('+91', '');

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
                    <p className="text-[var(--text-secondary)]">Sign in with your phone number</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP}>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Phone Number
                            </label>
                            <div className="flex gap-2 mb-4">
                                <div className="input w-20 flex items-center justify-center text-center shrink-0">
                                    +91
                                </div>
                                <input
                                    type="tel"
                                    className="input flex-1"
                                    placeholder="Enter your phone number"
                                    value={phone.replace('+91', '')}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    required
                                    maxLength={10}
                                    id="phone-input"
                                />
                            </div>

                            {isAdmin && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm">
                                    🔐 Admin account detected
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary w-full py-3"
                                disabled={loading || phone.replace('+91', '').length < 10}
                                id="send-otp-btn"
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                OTP sent to <span className="text-white font-medium">{phone}</span>
                            </p>

                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                className="input mb-4"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                maxLength={6}
                                id="otp-input"
                            />

                            {error && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary w-full py-3 mb-3"
                                disabled={loading || otp.length < 6}
                                id="verify-otp-btn"
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Verify & Sign In'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                                className="w-full text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
                            >
                                ← Change phone number
                            </button>
                        </form>
                    )}
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

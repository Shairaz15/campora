'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_PHONE } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen gradient-bg flex items-center justify-center"><div className="spinner"></div></div>}>
            <SignupContent />
        </Suspense>
    );
}

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOnboard = searchParams.get('onboard') === 'true';
    const supabase = createClient();

    const [step, setStep] = useState(isOnboard ? 'profile' : 'phone'); // phone | otp | profile
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        semester: '',
        department: '',
        section: '',
        graduation_year: '',
    });

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

        const { error: verifyError } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (verifyError) {
            setError(verifyError.message);
            setLoading(false);
            return;
        }

        setStep('profile');
        setLoading(false);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate .edu email
        if (!profile.email.endsWith('.edu')) {
            setError('Email must end with .edu');
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        // Check if this is the admin phone
        const isAdmin = user.phone === ADMIN_PHONE;

        const { error: insertError } = await supabase.from('users').upsert({
            id: user.id,
            name: profile.name,
            email: profile.email,
            phone: user.phone,
            semester: profile.semester,
            department: profile.department,
            section: profile.section,
            graduation_year: parseInt(profile.graduation_year) || null,
            role: isAdmin ? 'admin' : 'student',
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        router.push(isAdmin ? '/admin' : '/marketplace');
        setLoading(false);
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md page-enter">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-lg">
                            C
                        </div>
                        <span className="text-2xl font-bold neon-text">Campora</span>
                    </div>
                    <p className="text-[var(--text-secondary)]">
                        {step === 'profile' ? 'Complete your profile' : 'Create your account'}
                    </p>
                </div>

                {/* Progress indicators */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {['phone', 'otp', 'profile'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s
                                ? 'bg-cyan-500 text-black'
                                : ['phone', 'otp', 'profile'].indexOf(step) > i
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                                }`}>
                                {i + 1}
                            </div>
                            {i < 2 && (
                                <div className={`w-12 h-0.5 ${['phone', 'otp', 'profile'].indexOf(step) > i
                                    ? 'bg-cyan-500/40'
                                    : 'bg-[var(--border-color)]'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="card p-8">
                    {/* Step 1: Phone */}
                    {step === 'phone' && (
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
                                    placeholder="Enter phone number"
                                    value={phone.replace('+91', '')}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    required
                                    maxLength={10}
                                    id="signup-phone"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary w-full py-3"
                                disabled={loading || phone.replace('+91', '').length < 10}
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Send OTP →'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
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
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                maxLength={6}
                                id="signup-otp"
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
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Verify →'}
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

                    {/* Step 3: Profile */}
                    {step === 'profile' && (
                        <form onSubmit={handleProfileSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="John Doe"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                        id="signup-name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        College Email * <span className="text-cyan-400 text-xs">(.edu only)</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="you@university.edu"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        required
                                        id="signup-email"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Semester</label>
                                        <select
                                            className="input"
                                            value={profile.semester}
                                            onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                                            id="signup-semester"
                                        >
                                            <option value="">Select</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                <option key={s} value={s}>Sem {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="CSE, ECE..."
                                            value={profile.department}
                                            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                            id="signup-dept"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Section</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="A, B, C..."
                                            value={profile.section}
                                            onChange={(e) => setProfile({ ...profile, section: e.target.value })}
                                            id="signup-section"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Grad Year</label>
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="2028"
                                            value={profile.graduation_year}
                                            onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
                                            id="signup-gradyear"
                                        />
                                    </div>
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
                                disabled={loading || !profile.name || !profile.email}
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Complete Signup →'}
                            </button>
                        </form>
                    )}
                </div>

                {step !== 'profile' && (
                    <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-cyan-400 hover:underline">
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}

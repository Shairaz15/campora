'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState('credentials'); // credentials | profile
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        semester: '',
        department: '',
        section: '',
        graduation_year: '',
    });

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate .edu email
        if (!credentials.email.endsWith('.edu')) {
            setError('Email must end with .edu');
            setLoading(false);
            return;
        }

        if (credentials.password !== credentials.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (credentials.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const { error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            setError(authError.message);
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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Please check your email for verification, then log in.');
            setLoading(false);
            return;
        }

        const isAdmin = credentials.email === ADMIN_EMAIL;

        const { error: insertError } = await supabase.from('users').upsert({
            id: user.id,
            name: profile.name,
            email: credentials.email,
            phone: profile.phone,
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

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {['credentials', 'profile'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s
                                    ? 'bg-cyan-500 text-black'
                                    : ['credentials', 'profile'].indexOf(step) > i
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                                }`}>
                                {i + 1}
                            </div>
                            {i < 1 && (
                                <div className={`w-16 h-0.5 ${step === 'profile' ? 'bg-cyan-500/40' : 'bg-[var(--border-color)]'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="card p-8">
                    {/* Step 1: Email + Password */}
                    {step === 'credentials' && (
                        <form onSubmit={handleSignUp}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        College Email * <span className="text-cyan-400 text-xs">(.edu only)</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="you@university.edu"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                        required
                                        id="signup-email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password *</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Min 6 characters"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                        minLength={6}
                                        id="signup-password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirm Password *</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Re-enter password"
                                        value={credentials.confirmPassword}
                                        onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                                        required
                                        id="signup-confirm"
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
                                disabled={loading || !credentials.email || !credentials.password}
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Continue →'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Profile */}
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
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+91 9876543210"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        id="signup-phone"
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
                                disabled={loading || !profile.name}
                            >
                                {loading ? <span className="spinner mx-auto"></span> : 'Complete Signup →'}
                            </button>
                        </form>
                    )}
                </div>

                {step === 'credentials' && (
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

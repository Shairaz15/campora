'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
    const supabase = createClient();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [stats, setStats] = useState({ buys: 0, sells: 0, swaps: 0 });
    const [saving, setSaving] = useState(false);
    const user = getCurrentUser();

    useEffect(() => {
        if (user) {
            fetchProfileData(user.id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfileData = async (userId) => {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        if (data) {
            setProfile(data);
            setForm(data);
        } else {
            // Use hardcoded user data as fallback
            setProfile(user);
            setForm(user);
        }

        // Fetch stats
        const [sellRes, swapRes] = await Promise.all([
            supabase.from('products').select('id', { count: 'exact' }).eq('seller_id', userId).eq('status', 'sold'),
            supabase.from('swaps').select('id', { count: 'exact' }).eq('proposer_id', userId).eq('status', 'completed'),
        ]);
        setStats({
            buys: 0,
            sells: sellRes.count || 0,
            swaps: swapRes.count || 0,
        });
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await supabase
            .from('users')
            .update({
                name: form.name,
                semester: form.semester,
                department: form.department,
                section: form.section,
                graduation_year: parseInt(form.graduation_year) || null,
            })
            .eq('id', user.id);

        setEditing(false);
        fetchProfileData(user.id);
        setSaving(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>;
    }

    if (!profile) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
                My <span className="neon-text">Profile</span>
            </h1>

            <div className="card p-8 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-purple-600 flex items-center justify-center text-3xl font-bold">
                        {profile.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                            {profile.is_verified && (
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                                    Verified ✓
                                </span>
                            )}
                            {profile.role === 'admin' && (
                                <span className="bg-red-700/20 text-red-500 px-3 py-1 rounded-full text-xs font-medium">
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--text-secondary)]">{profile.email}</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Joined {formatDate(profile.created_at) || 'Recently'}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Buys', value: stats.buys, icon: '🛍️' },
                        { label: 'Sells', value: stats.sells, icon: '💰' },
                        { label: 'Swaps', value: stats.swaps, icon: '🔄' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <div className="text-2xl font-bold text-red-500">{stat.value}</div>
                            <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Badges */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Badges</h3>
                    <div className="flex gap-2 flex-wrap">
                        {profile.is_verified && (
                            <span className="badge bg-green-500/20 text-green-400">🛡️ Verified Student</span>
                        )}
                        {stats.sells >= 1 && (
                            <span className="badge bg-red-700/20 text-red-500">⭐ Active Seller</span>
                        )}
                        {stats.buys + stats.sells + stats.swaps >= 5 && (
                            <span className="badge bg-red-600/20 text-red-500">🏆 Top Trader</span>
                        )}
                        {stats.buys + stats.sells + stats.swaps === 0 && !profile.is_verified && (
                            <span className="badge bg-gray-500/20 text-gray-400">🌱 New Member</span>
                        )}
                    </div>
                </div>

                {/* Edit form */}
                {editing ? (
                    <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                            <input type="text" className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Semester</label>
                                <select className="input" value={form.semester || ''} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                                    <option value="">Select</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (<option key={s} value={s}>Sem {s}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Department</label>
                                <input type="text" className="input" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Section</label>
                                <input type="text" className="input" value={form.section || ''} onChange={(e) => setForm({ ...form, section: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-1">Grad Year</label>
                                <input type="number" className="input" value={form.graduation_year || ''} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                                {saving ? <span className="spinner mx-auto"></span> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-[var(--border-color)]">
                            <div><span className="text-xs text-[var(--text-secondary)]">Phone</span><p className="font-medium">{profile.phone || '—'}</p></div>
                            <div><span className="text-xs text-[var(--text-secondary)]">Semester</span><p className="font-medium">{profile.semester ? `Sem ${profile.semester}` : '—'}</p></div>
                            <div><span className="text-xs text-[var(--text-secondary)]">Department</span><p className="font-medium">{profile.department || '—'}</p></div>
                            <div><span className="text-xs text-[var(--text-secondary)]">Section</span><p className="font-medium">{profile.section || '—'}</p></div>
                            <div><span className="text-xs text-[var(--text-secondary)]">Graduation Year</span><p className="font-medium">{profile.graduation_year || '—'}</p></div>
                        </div>
                        <button onClick={() => setEditing(true)} className="btn-secondary w-full" id="edit-profile-btn">
                            ✏️ Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

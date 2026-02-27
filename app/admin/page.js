'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ escrow: 0, verify: 0, users: 0, products: 0 });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const [escrowRes, verifyRes, usersRes, productsRes] = await Promise.all([
            supabase.from('escrow_transactions').select('id', { count: 'exact' }).eq('status', 'held'),
            supabase.from('users').select('id', { count: 'exact' }).not('id_card_url', 'is', null).eq('is_verified', false),
            supabase.from('users').select('id', { count: 'exact' }),
            supabase.from('products').select('id', { count: 'exact' }),
        ]);

        setStats({
            escrow: escrowRes.count || 0,
            verify: verifyRes.count || 0,
            users: usersRes.count || 0,
            products: productsRes.count || 0,
        });
        setLoading(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">
                Admin <span className="neon-text">Dashboard</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">Manage escrow transactions and student verification</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Pending Escrow', value: stats.escrow, icon: '🛡️', color: 'text-orange-400' },
                    { label: 'ID Verification', value: stats.verify, icon: '🪪', color: 'text-blue-400' },
                    { label: 'Total Users', value: stats.users, icon: '👥', color: 'text-green-400' },
                    { label: 'Total Products', value: stats.products, icon: '📦', color: 'text-purple-400' },
                ].map((stat) => (
                    <div key={stat.label} className="card p-5">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/escrow" className="card p-6 flex items-center gap-4 hover:border-orange-500/30" id="admin-escrow-link">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl">🛡️</div>
                    <div>
                        <h3 className="font-semibold text-lg">Escrow Management</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Review and approve pending transactions</p>
                    </div>
                    {stats.escrow > 0 && (
                        <span className="ml-auto bg-orange-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                            {stats.escrow}
                        </span>
                    )}
                </Link>

                <Link href="/admin/verify" className="card p-6 flex items-center gap-4 hover:border-blue-500/30" id="admin-verify-link">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">🪪</div>
                    <div>
                        <h3 className="font-semibold text-lg">ID Verification</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Verify student identity cards</p>
                    </div>
                    {stats.verify > 0 && (
                        <span className="ml-auto bg-blue-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                            {stats.verify}
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
}

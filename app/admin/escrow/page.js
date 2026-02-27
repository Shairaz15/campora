'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getStatusBadge } from '@/lib/utils';

export default function EscrowManagement() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('held');
    const supabase = createClient();

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        setLoading(true);
        let query = supabase
            .from('escrow_transactions')
            .select(`
        *,
        product:products(id, title, price),
        buyer:users!escrow_transactions_buyer_id_fkey(id, name, email, phone),
        seller:users!escrow_transactions_seller_id_fkey(id, name, email, phone)
      `)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data } = await query;
        setTransactions(data || []);
        setLoading(false);
    };

    const handleAction = async (id, newStatus) => {
        await supabase
            .from('escrow_transactions')
            .update({ status: newStatus })
            .eq('id', id);

        fetchTransactions();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">
                Escrow <span className="neon-text">Management</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">Review and manage escrow transactions</p>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['held', 'admin_approved', 'completed', 'rejected', 'all'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                ? 'bg-red-600 text-black'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                            }`}
                    >
                        {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-secondary)]">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-lg font-medium text-white">No transactions</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {transactions.map((tx) => {
                        const badge = getStatusBadge(tx.status);
                        return (
                            <div key={tx.id} className="card p-6" id={`escrow-${tx.id}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{tx.product?.title || 'Product'}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            ₹{tx.product?.price} • {tx.transaction_type} • {formatDate(tx.created_at)}
                                        </p>
                                    </div>
                                    <span className={`badge ${badge.color}`}>{badge.label}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                                        <span className="text-xs text-[var(--text-secondary)]">Buyer</span>
                                        <p className="font-medium">{tx.buyer?.name}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{tx.buyer?.email}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{tx.buyer?.phone}</p>
                                    </div>
                                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
                                        <span className="text-xs text-[var(--text-secondary)]">Seller</span>
                                        <p className="font-medium">{tx.seller?.name}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{tx.seller?.email}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{tx.seller?.phone}</p>
                                    </div>
                                </div>

                                {tx.status === 'held' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction(tx.id, 'admin_approved')}
                                            className="btn-primary flex-1"
                                            id={`approve-${tx.id}`}
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(tx.id, 'rejected')}
                                            className="btn-danger flex-1"
                                            id={`reject-${tx.id}`}
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                )}

                                {tx.status === 'admin_approved' && (
                                    <div className="text-sm text-red-500 bg-red-600/10 rounded-lg p-3 text-center">
                                        ⏳ Waiting for buyer to confirm receipt
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

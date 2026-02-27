'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function VerifyStudents() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        setUsers(data || []);
        setLoading(false);
    };

    const handleVerify = async (userId, verified) => {
        await supabase
            .from('users')
            .update({ is_verified: verified })
            .eq('id', userId);

        fetchUsers();
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>;
    }

    const pendingUsers = users.filter((u) => !u.is_verified && u.id_card_url);
    const allStudents = users.filter((u) => u.role === 'student');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">
                Student <span className="neon-text">Verification</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">Review and verify student identities</p>

            {/* Pending Verification */}
            {pendingUsers.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-orange-400">⏳ Pending Verification ({pendingUsers.length})</h2>
                    <div className="space-y-4">
                        {pendingUsers.map((user) => (
                            <div key={user.id} className="card p-6" id={`verify-${user.id}`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-lg shrink-0">
                                        {user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{user.name}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {user.department} • Sem {user.semester} • {user.section}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">Joined {formatDate(user.created_at)}</p>

                                        {user.id_card_url && (
                                            <a
                                                href={user.id_card_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-2 text-cyan-400 text-sm hover:underline"
                                            >
                                                📎 View ID Card
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleVerify(user.id, true)}
                                            className="btn-primary text-sm px-4 py-2"
                                        >
                                            ✅ Verify
                                        </button>
                                        <button
                                            onClick={() => handleVerify(user.id, false)}
                                            className="btn-danger text-sm px-4 py-2"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Students */}
            <h2 className="text-xl font-semibold mb-4">All Students ({allStudents.length})</h2>
            <div className="space-y-3">
                {allStudents.map((user) => (
                    <div key={user.id} className="card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{user.name}</span>
                                {user.is_verified && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Verified ✓</span>
                                )}
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] truncate">{user.email}</p>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">{user.department}</div>
                        {!user.is_verified && (
                            <button
                                onClick={() => handleVerify(user.id, true)}
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                Verify
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

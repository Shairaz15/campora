'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

export default function ChatListPage() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        const { data } = await supabase
            .from('chats')
            .select(`
        *,
        product:products(id, title, image_urls),
        buyer:users!chats_buyer_id_fkey(id, name),
        seller:users!chats_seller_id_fkey(id, name)
      `)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        setChats(data || []);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
                <span className="neon-text">Messages</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
                Your conversations with buyers and sellers
            </p>

            {chats.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-secondary)]">
                    <div className="text-5xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
                    <p className="text-sm">Start chatting by making an offer on a product!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {chats.map((chat) => {
                        const otherUser = chat.buyer_id === currentUser?.id ? chat.seller : chat.buyer;
                        return (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className="card p-4 flex items-center gap-4 hover:border-cyan-500/30"
                                id={`chat-${chat.id}`}
                            >
                                {/* Product thumbnail */}
                                <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] overflow-hidden shrink-0">
                                    {chat.product?.image_urls?.[0] ? (
                                        <img src={chat.product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{otherUser?.name || 'User'}</span>
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            {timeAgo(chat.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] truncate">
                                        Re: {chat.product?.title || 'Product'}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

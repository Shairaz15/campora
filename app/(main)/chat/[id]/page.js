'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

export default function ChatRoomPage() {
    const { id: chatId } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const messagesEndRef = useRef(null);

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const currentUser = getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [swaps, setSwaps] = useState([]);

    useEffect(() => {
        fetchChat();
        fetchMessages();
        fetchTransactions();

        // Subscribe to realtime messages
        const channel = supabase
            .channel(`messages:${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChat = async () => {

        const { data } = await supabase
            .from('chats')
            .select(`
        *,
        product:products(id, title, price, status, seller_id, transaction_type),
        buyer:users!chats_buyer_id_fkey(id, name),
        seller:users!chats_seller_id_fkey(id, name)
      `)
            .eq('id', chatId)
            .single();

        setChat(data);
        setLoading(false);
    };

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        setMessages(data || []);
    };

    const fetchTransactions = async () => {
        // Get offers for this product
        const { data: chatData } = await supabase
            .from('chats')
            .select('product_id, buyer_id')
            .eq('id', chatId)
            .single();

        if (chatData) {
            const { data: offerData } = await supabase
                .from('offers')
                .select('*')
                .eq('product_id', chatData.product_id)
                .eq('buyer_id', chatData.buyer_id)
                .order('created_at', { ascending: false });
            setOffers(offerData || []);

            const { data: swapData } = await supabase
                .from('swaps')
                .select('*')
                .eq('product_id', chatData.product_id)
                .eq('proposer_id', chatData.buyer_id)
                .order('created_at', { ascending: false });
            setSwaps(swapData || []);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: currentUser.id,
            message: newMessage.trim(),
        });

        setNewMessage('');
    };

    const handleOfferAction = async (offerId, action) => {
        await supabase
            .from('offers')
            .update({ status: action })
            .eq('id', offerId);

        if (action === 'accepted') {
            // Send system message
            await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: currentUser.id,
                message: `✅ Offer accepted! You can now use Escrow for safe transaction.`,
            });
        }

        fetchTransactions();
    };

    const handleSwapAction = async (swapId, action) => {
        await supabase
            .from('swaps')
            .update({ status: action })
            .eq('id', swapId);

        if (action === 'accepted') {
            await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: currentUser.id,
                message: `✅ Swap accepted! Coordinate the exchange.`,
            });
        }

        fetchTransactions();
    };

    const handleEscrow = async (offer) => {
        if (!chat) return;

        await supabase.from('escrow_transactions').insert({
            product_id: chat.product?.id,
            buyer_id: chat.buyer_id,
            seller_id: chat.seller_id,
            offer_id: offer.id,
            transaction_type: 'cash',
            status: 'held',
        });

        await supabase.from('messages').insert({
            chat_id: chatId,
            sender_id: currentUser.id,
            message: `🛡️ Escrow initiated! Payment is now held. Waiting for admin approval.`,
        });

        fetchTransactions();
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>;
    }

    if (!chat) return null;

    const otherUser = chat.buyer_id === currentUser?.id ? chat.seller : chat.buyer;
    const isSeller = currentUser?.id === chat.seller_id;

    return (
        <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div className="card p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/chat')} className="text-[var(--text-secondary)] hover:text-white">
                        ←
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                        {otherUser?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium">{otherUser?.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Re: {chat.product?.title}
                        </div>
                    </div>
                </div>
                <div className="pulse-dot"></div>
            </div>

            {/* Transaction status bar */}
            {(offers.length > 0 || swaps.length > 0) && (
                <div className="card p-3 mb-4 space-y-2">
                    {offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between text-sm">
                            <span>
                                💰 Offer: ₹{offer.offer_amount} —{' '}
                                <span className={`font-medium ${offer.status === 'accepted' ? 'text-green-400' :
                                    offer.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {offer.status}
                                </span>
                            </span>
                            <div className="flex gap-2">
                                {isSeller && offer.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleOfferAction(offer.id, 'accepted')} className="text-green-400 hover:underline text-xs">Accept</button>
                                        <button onClick={() => handleOfferAction(offer.id, 'rejected')} className="text-red-400 hover:underline text-xs">Reject</button>
                                    </>
                                )}
                                {offer.status === 'accepted' && !isSeller && (
                                    <button onClick={() => handleEscrow(offer)} className="text-cyan-400 hover:underline text-xs">🛡️ Use Escrow</button>
                                )}
                            </div>
                        </div>
                    ))}
                    {swaps.map((swap) => (
                        <div key={swap.id} className="flex items-center justify-between text-sm">
                            <span>
                                🔄 Swap —{' '}
                                <span className={`font-medium ${swap.status === 'accepted' ? 'text-green-400' :
                                    swap.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {swap.status}
                                </span>
                            </span>
                            {isSeller && swap.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleSwapAction(swap.id, 'accepted')} className="text-green-400 hover:underline text-xs">Accept</button>
                                    <button onClick={() => handleSwapAction(swap.id, 'rejected')} className="text-red-400 hover:underline text-xs">Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1">
                {messages.map((msg) => {
                    const isMine = msg.sender_id === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                    ? 'bg-cyan-500/20 text-cyan-100 rounded-br-md'
                                    : 'bg-[var(--bg-card)] text-white rounded-bl-md border border-[var(--border-color)]'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                <span className="text-[10px] text-[var(--text-secondary)] mt-1 block text-right">
                                    {timeAgo(msg.created_at)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    className="input flex-1"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    id="chat-input"
                />
                <button
                    type="submit"
                    className="btn-primary px-6"
                    disabled={!newMessage.trim()}
                    id="send-message-btn"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

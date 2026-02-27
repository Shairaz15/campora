'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export default function OfferModal({ product, onClose, onSuccess }) {
    const [amount, setAmount] = useState(product.price || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const user = getCurrentUser();
        if (!user) return;

        // Create offer
        const { error: offerError } = await supabase.from('offers').insert({
            product_id: product.id,
            buyer_id: user.id,
            offer_amount: parseFloat(amount),
        });

        if (offerError) {
            setError(offerError.message);
            setLoading(false);
            return;
        }

        // Create/get chat and send offer message
        const { data: existingChat } = await supabase
            .from('chats')
            .select('id')
            .eq('product_id', product.id)
            .eq('buyer_id', user.id)
            .eq('seller_id', product.seller_id)
            .single();

        let chatId = existingChat?.id;

        if (!chatId) {
            const { data: newChat } = await supabase
                .from('chats')
                .insert({
                    product_id: product.id,
                    buyer_id: user.id,
                    seller_id: product.seller_id,
                })
                .select()
                .single();
            chatId = newChat?.id;
        }

        if (chatId) {
            await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: user.id,
                message: `💰 New Offer: ₹${amount} for "${product.title}"`,
            });
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
            <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Make an Offer</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    For: <span className="text-white">{product.title}</span>
                    <br />
                    Listed price: <span className="text-red-500">₹{product.price}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Your Offer (₹)
                    </label>
                    <input
                        type="number"
                        className="input mb-4"
                        placeholder="Enter your offer"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                        id="offer-amount"
                    />

                    {error && (
                        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading || !amount}
                            id="submit-offer"
                        >
                            {loading ? <span className="spinner mx-auto"></span> : 'Send Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

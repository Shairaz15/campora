'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SwapModal({ product, onClose, onSuccess }) {
    const [userProducts, setUserProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    useEffect(() => {
        fetchUserProducts();
    }, []);

    const fetchUserProducts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('products')
            .select('id, title, price')
            .eq('seller_id', user.id)
            .eq('status', 'active');

        setUserProducts(data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: swapError } = await supabase.from('swaps').insert({
            product_id: product.id,
            proposer_id: user.id,
            proposed_product_id: selectedProduct || null,
            message: message,
        });

        if (swapError) {
            setError(swapError.message);
            setLoading(false);
            return;
        }

        // Send chat notification
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
                message: `🔄 Swap Proposal for "${product.title}": ${message || 'Check my items!'}`,
            });
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
            <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Propose a Swap</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    For: <span className="text-white">{product.title}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Select user's product to swap */}
                    {userProducts.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Select your item to swap (optional)
                            </label>
                            <select
                                className="input"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                id="swap-product-select"
                            >
                                <option value="">No specific item</option>
                                {userProducts.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} {p.price ? `(₹${p.price})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Message to Seller
                        </label>
                        <textarea
                            className="input min-h-[80px] resize-y"
                            placeholder="What are you offering to swap?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            id="swap-message"
                        />
                    </div>

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
                            disabled={loading}
                            id="submit-swap"
                        >
                            {loading ? <span className="spinner mx-auto"></span> : 'Send Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

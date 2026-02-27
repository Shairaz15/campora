'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getTransactionBadge, getStatusBadge, timeAgo } from '@/lib/utils';
import OfferModal from '@/components/OfferModal';
import SwapModal from '@/components/SwapModal';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOffer, setShowOffer] = useState(false);
    const [showSwap, setShowSwap] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (!productData) {
            router.push('/marketplace');
            return;
        }

        setProduct(productData);

        const { data: sellerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', productData.seller_id)
            .single();

        setSeller(sellerData);
        setLoading(false);
    };

    const handleStartChat = async () => {
        if (!currentUser || !product) return;

        // Check for existing chat
        const { data: existingChat } = await supabase
            .from('chats')
            .select('id')
            .eq('product_id', product.id)
            .eq('buyer_id', currentUser.id)
            .eq('seller_id', product.seller_id)
            .single();

        if (existingChat) {
            router.push(`/chat/${existingChat.id}`);
            return;
        }

        // Create new chat
        const { data: newChat } = await supabase
            .from('chats')
            .insert({
                product_id: product.id,
                buyer_id: currentUser.id,
                seller_id: product.seller_id,
            })
            .select()
            .single();

        if (newChat) {
            router.push(`/chat/${newChat.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) return null;

    const txBadge = getTransactionBadge(product.transaction_type);
    const statusBadge = getStatusBadge(product.status);
    const isOwner = currentUser?.id === product.seller_id;

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => router.back()} className="text-[var(--text-secondary)] hover:text-white mb-6 flex items-center gap-2 text-sm">
                ← Back to Marketplace
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image gallery */}
                <div>
                    <div className="card overflow-hidden aspect-square mb-3">
                        {product.image_urls?.[selectedImage] ? (
                            <img
                                src={product.image_urls[selectedImage]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl bg-[var(--bg-secondary)]">
                                📦
                            </div>
                        )}
                    </div>

                    {product.image_urls?.length > 1 && (
                        <div className="flex gap-2">
                            {product.image_urls.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-cyan-500' : 'border-transparent'
                                        }`}
                                >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product details */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`badge ${txBadge.color}`}>{txBadge.label}</span>
                        <span className={`badge ${statusBadge.color}`}>{statusBadge.label}</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

                    <div className="flex items-center gap-4 mb-6 text-sm text-[var(--text-secondary)]">
                        <span>📍 {product.location_type === 'escrow' ? 'Escrow' : 'In-Campus'}</span>
                        <span>📂 {product.category}</span>
                        <span>🕐 {timeAgo(product.created_at)}</span>
                    </div>

                    <div className="text-3xl font-bold text-cyan-400 mb-6">
                        {product.transaction_type === 'swap' ? 'Swap Only' : `₹${product.price}`}
                    </div>

                    <div className="card p-5 mb-6">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
                            {product.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Seller info */}
                    {seller && (
                        <div className="card p-5 mb-6">
                            <h3 className="font-semibold mb-3">Seller</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                                    {seller.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{seller.name}</span>
                                        {seller.is_verified && (
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Verified ✓</span>
                                        )}
                                    </div>
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        {seller.department} • Sem {seller.semester}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {!isOwner && product.status === 'active' && (
                        <div className="flex flex-col gap-3">
                            {(product.transaction_type === 'cash' || product.transaction_type === 'both') && (
                                <button onClick={() => setShowOffer(true)} className="btn-primary w-full py-3 text-base" id="make-offer-btn">
                                    💰 Make an Offer
                                </button>
                            )}
                            {(product.transaction_type === 'swap' || product.transaction_type === 'both') && (
                                <button onClick={() => setShowSwap(true)} className="btn-secondary w-full py-3 text-base" id="propose-swap-btn">
                                    🔄 Propose Swap
                                </button>
                            )}
                            <button onClick={handleStartChat} className="btn-secondary w-full py-3 text-base border-cyan-500/30 text-cyan-400" id="chat-seller-btn">
                                💬 Chat with Seller
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showOffer && (
                <OfferModal
                    product={product}
                    onClose={() => setShowOffer(false)}
                    onSuccess={() => { setShowOffer(false); fetchProduct(); }}
                />
            )}
            {showSwap && (
                <SwapModal
                    product={product}
                    onClose={() => setShowSwap(false)}
                    onSuccess={() => { setShowSwap(false); fetchProduct(); }}
                />
            )}
        </div>
    );
}

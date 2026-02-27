'use client';

import Link from 'next/link';
import { getTransactionBadge } from '@/lib/utils';

export default function ProductCard({ product }) {
    const badge = getTransactionBadge(product.transaction_type);

    return (
        <Link href={`/product/${product.id}`} className="card overflow-hidden group" id={`product-${product.id}`}>
            {/* Image */}
            <div className="aspect-square bg-[var(--bg-secondary)] relative overflow-hidden">
                {product.image_urls?.[0] ? (
                    <img
                        src={product.image_urls[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--text-secondary)]">
                        📦
                    </div>
                )}

                {/* Tags */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`badge ${badge.color}`}>{badge.label}</span>
                </div>

                {product.status !== 'active' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-lg font-bold uppercase text-white/80">{product.status}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-white truncate mb-1">{product.title}</h3>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-500">
                        {product.transaction_type === 'swap' ? 'Swap Only' : `₹${product.price}`}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        📍 {product.location_type === 'escrow' ? 'Escrow' : 'In-Campus'}
                    </span>
                </div>
            </div>
        </Link>
    );
}

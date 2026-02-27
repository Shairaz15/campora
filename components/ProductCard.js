'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
    const typeLabel = {
        sell: 'For Sale',
        swap: 'Swap',
        both: 'Sale / Swap',
    };

    return (
        <Link
            href={`/product/${product.id}`}
            className="group block bg-[#141416] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            id={`product-${product.id}`}
        >
            {/* Image */}
            <div className="aspect-[4/3] bg-[#0e0e10] relative overflow-hidden">
                {product.image_urls?.[0] ? (
                    <img
                        src={product.image_urls[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#27272A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                    </div>
                )}

                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141416] to-transparent pointer-events-none" />

                {/* Transaction type badge */}
                <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0B0B0D]/80 backdrop-blur-sm text-[#A1A1AA]">
                        {typeLabel[product.transaction_type] || 'Listing'}
                    </span>
                </div>

                {product.status !== 'active' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-sm font-bold uppercase tracking-widest text-white/60">{product.status}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-5">
                <h3 className="font-semibold text-white truncate mb-3 text-[15px]">{product.title}</h3>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#E10600]">
                        {product.transaction_type === 'swap' ? 'Swap Only' : `₹${product.price}`}
                    </span>
                    <span className="text-xs text-[#52525B] flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        {product.location_type === 'escrow' ? 'Escrow' : 'In-Campus'}
                    </span>
                </div>
            </div>
        </Link>
    );
}

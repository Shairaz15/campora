'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES, SERVICES } from '@/lib/utils';
import Link from 'next/link';

export default function MarketplacePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showServices, setShowServices] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (activeCategory !== 'All') {
            query = query.eq('category', activeCategory);
        }

        const { data } = await query;
        setProducts(data || []);
        setLoading(false);
    };

    const filteredProducts = products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const allCategories = ['All', ...CATEGORIES];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="pt-10 pb-10">
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Marketplace</h1>
                <p className="text-[#71717A] text-base">Buy, sell, and swap within your verified campus.</p>
            </div>

            {/* Search + Filter Bar */}
            <div className="bg-[#141416] rounded-2xl border border-[rgba(255,255,255,0.06)] p-5 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="text"
                            className="w-full bg-[#0B0B0D] border border-[rgba(255,255,255,0.06)] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#52525B] transition-all duration-150 outline-none focus:border-[#E10600]/40 focus:ring-1 focus:ring-[#E10600]/10"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            id="search-input"
                        />
                    </div>

                    {/* Services toggle */}
                    <button
                        onClick={() => setShowServices(!showServices)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${showServices
                            ? 'border-[#E10600]/30 text-[#E10600] bg-[#E10600]/5'
                            : 'border-[rgba(255,255,255,0.06)] text-[#71717A] hover:text-white hover:border-[rgba(255,255,255,0.1)] bg-[#0B0B0D]'
                            }`}
                        id="services-toggle"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
                        </svg>
                        Services
                        <svg className={`w-3 h-3 transition-transform duration-200 ${showServices ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pt-4 scrollbar-hide">
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border ${activeCategory === cat
                                ? 'bg-[#E10600] text-white border-[#E10600]'
                                : 'bg-transparent text-[#71717A] border-[rgba(255,255,255,0.06)] hover:text-white hover:border-[rgba(255,255,255,0.12)]'
                                }`}
                            id={`cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                {showServices && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-4 border-t border-[rgba(255,255,255,0.04)] mt-4">
                        {SERVICES.map((service) => (
                            <button
                                key={service}
                                onClick={() => setActiveCategory(service)}
                                className={`p-3 rounded-xl text-xs font-medium text-center transition-all duration-150 border ${activeCategory === service
                                    ? 'border-[#E10600]/30 text-[#E10600] bg-[#E10600]/5'
                                    : 'border-[rgba(255,255,255,0.04)] text-[#71717A] hover:text-white hover:border-[rgba(255,255,255,0.08)]'
                                    }`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-6 h-6 border-2 border-[#27272A] border-t-[#E10600] rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-32">
                    <svg className="w-12 h-12 mx-auto mb-5 text-[#27272A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
                    <p className="text-sm text-[#52525B] mb-8">Be the first to list something.</p>
                    <Link
                        href="/sell"
                        className="inline-flex bg-[#E10600] hover:bg-[#B80500] text-white text-sm font-semibold px-8 py-3 rounded-xl transition-all duration-150 hover:-translate-y-[1px]"
                    >
                        Create Listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, i) => (
                        <div key={product.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-[fadeUp_0.3s_ease-out_both]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

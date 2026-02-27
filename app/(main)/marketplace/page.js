'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES, SERVICES } from '@/lib/utils';

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
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Campus <span className="neon-text">Marketplace</span>
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Discover products and services from your campus community
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    className="input max-w-md"
                    placeholder="🔍 Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="search-input"
                />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-red-600 text-black'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
                            }`}
                        id={`cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Services Section */}
            <div className="mb-8">
                <button
                    onClick={() => setShowServices(!showServices)}
                    className="card px-5 py-4 w-full text-left flex items-center justify-between"
                    id="services-toggle"
                >
                    <div>
                        <h3 className="font-semibold text-white">🛠 Services</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Tutoring, Design, Coding & more</p>
                    </div>
                    <span className={`text-xl transition-transform ${showServices ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showServices && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                        {SERVICES.map((service) => (
                            <button
                                key={service}
                                onClick={() => setActiveCategory(service)}
                                className={`card p-3 text-center text-sm font-medium transition-all ${activeCategory === service
                                        ? 'border-red-600/50 text-red-500'
                                        : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-secondary)]">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                    <p className="text-sm">Be the first to list something!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

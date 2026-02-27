'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CATEGORIES, SERVICES } from '@/lib/utils';

export default function SellPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        transaction_type: 'cash',
        location_type: 'in-campus',
        category: '',
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        setImageFiles(files);
        const previews = files.map((f) => URL.createObjectURL(f));
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upload images
        const imageUrls = [];
        for (const file of imageFiles) {
            const ext = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, file);

            if (!uploadError && uploadData) {
                const { data: urlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(uploadData.path);
                imageUrls.push(urlData.publicUrl);
            }
        }

        const { error: insertError } = await supabase.from('products').insert({
            seller_id: user.id,
            title: form.title,
            description: form.description,
            price: form.transaction_type === 'swap' ? 0 : parseFloat(form.price) || 0,
            transaction_type: form.transaction_type,
            location_type: form.location_type,
            category: form.category,
            image_urls: imageUrls,
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        router.push('/marketplace');
    };

    const allCategories = [...CATEGORIES, ...SERVICES];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
                List a <span className="neon-text">Product</span>
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
                Share what you want to sell or swap with your campus
            </p>

            <form onSubmit={handleSubmit} className="card p-8">
                <div className="space-y-5">
                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Product Images <span className="text-xs">(up to 4)</span>
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)]">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors" id="image-upload-label">
                                <span className="text-2xl text-[var(--text-secondary)]">+</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                    id="image-upload"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="What are you selling?"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            id="sell-title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                        <textarea
                            className="input min-h-[120px] resize-y"
                            placeholder="Describe your item in detail..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            id="sell-description"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label>
                        <select
                            className="input"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            required
                            id="sell-category"
                        >
                            <option value="">Select category</option>
                            <optgroup label="Products">
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Services">
                                {SERVICES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Transaction Type *</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'cash', label: '💰 Cash', desc: 'Sell for money' },
                                { value: 'swap', label: '🔄 Swap', desc: 'Trade only' },
                                { value: 'both', label: '🤝 Both', desc: 'Cash or swap' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, transaction_type: opt.value })}
                                    className={`flex-1 card p-3 text-center transition-all ${form.transaction_type === opt.value
                                            ? 'border-cyan-500/50 bg-cyan-500/5'
                                            : ''
                                        }`}
                                >
                                    <div className="text-lg mb-1">{opt.label.split(' ')[0]}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    {form.transaction_type !== 'swap' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Price (₹) *</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="Enter price"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                required
                                min="0"
                                id="sell-price"
                            />
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location Type</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, location_type: 'in-campus' })}
                                className={`flex-1 card p-3 text-center text-sm ${form.location_type === 'in-campus' ? 'border-cyan-500/50 bg-cyan-500/5' : ''
                                    }`}
                            >
                                📍 In-Campus
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, location_type: 'escrow' })}
                                className={`flex-1 card p-3 text-center text-sm ${form.location_type === 'escrow' ? 'border-cyan-500/50 bg-cyan-500/5' : ''
                                    }`}
                            >
                                🛡️ Escrow
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary w-full py-3 mt-6 text-base"
                    disabled={loading || !form.title || !form.category}
                    id="sell-submit"
                >
                    {loading ? <span className="spinner mx-auto"></span> : 'List Product →'}
                </button>
            </form>
        </div>
    );
}

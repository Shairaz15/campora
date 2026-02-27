'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CATEGORIES, SERVICES, getTransactionBadge } from '@/lib/utils';

export default function SellPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        transaction_type: 'cash',
        location_type: 'in-campus',
        category: '',
    });

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false });

        setMyListings(data || []);
        setLoadingListings(false);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        setImageFiles(files);
        const previews = files.map((f) => URL.createObjectURL(f));
        setImagePreviews(previews);
    };

    const resetForm = () => {
        setForm({ title: '', description: '', price: '', transaction_type: 'cash', location_type: 'in-campus', category: '' });
        setImageFiles([]);
        setImagePreviews([]);
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (product) => {
        setForm({
            title: product.title,
            description: product.description || '',
            price: product.price?.toString() || '',
            transaction_type: product.transaction_type || 'cash',
            location_type: product.location_type || 'in-campus',
            category: product.category || '',
        });
        setEditingId(product.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (productId) => {
        if (!confirm('Delete this listing?')) return;
        await supabase.from('products').delete().eq('id', productId);
        fetchMyListings();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upload images (only for new listings or if new images selected)
        let imageUrls = [];
        if (imageFiles.length > 0) {
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
        }

        const productData = {
            title: form.title,
            description: form.description,
            price: form.transaction_type === 'swap' ? 0 : parseFloat(form.price) || 0,
            transaction_type: form.transaction_type,
            location_type: form.location_type,
            category: form.category,
        };

        if (imageUrls.length > 0) {
            productData.image_urls = imageUrls;
        }

        let result;
        if (editingId) {
            result = await supabase.from('products').update(productData).eq('id', editingId);
        } else {
            productData.seller_id = user.id;
            if (imageUrls.length > 0) productData.image_urls = imageUrls;
            result = await supabase.from('products').insert(productData);
        }

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
            return;
        }

        resetForm();
        fetchMyListings();
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="neon-text">Sell</span>
                    </h1>
                    <p className="text-[var(--text-secondary)]">Manage your listings</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="btn-primary"
                    id="new-listing-btn"
                >
                    {showForm ? '✕ Cancel' : '+ New Listing'}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card p-6 mb-8">
                    <h3 className="font-semibold text-lg mb-4">
                        {editingId ? '✏️ Edit Listing' : '📦 New Listing'}
                    </h3>
                    <div className="space-y-5">
                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Images <span className="text-xs">(up to 4)</span>
                            </label>
                            <div className="flex gap-3 flex-wrap">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)]">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                                    <span className="text-2xl text-[var(--text-secondary)]">+</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title *</label>
                            <input type="text" className="input" placeholder="What are you selling?" value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })} required id="sell-title" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                            <textarea className="input min-h-[100px] resize-y" placeholder="Describe your item..." value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} id="sell-description" />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label>
                            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required id="sell-category">
                                <option value="">Select category</option>
                                <optgroup label="Products">
                                    {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                                </optgroup>
                                <optgroup label="Services">
                                    {SERVICES.map((s) => (<option key={s} value={s}>{s}</option>))}
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
                                    <button key={opt.value} type="button"
                                        onClick={() => setForm({ ...form, transaction_type: opt.value })}
                                        className={`flex-1 p-3 text-center transition-all rounded-xl border-2 ${form.transaction_type === opt.value
                                            ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/30 text-white'
                                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{opt.label.split(' ')[0]}</div>
                                        <div className="text-xs">{opt.desc}</div>
                                        {form.transaction_type === opt.value && <div className="text-xs text-cyan-400 mt-1">✓ Selected</div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        {form.transaction_type !== 'swap' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Price (₹) *</label>
                                <input type="number" className="input" placeholder="Enter price" value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" id="sell-price" />
                            </div>
                        )}

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location Type</label>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setForm({ ...form, location_type: 'in-campus' })}
                                    className={`flex-1 p-3 text-center text-sm rounded-xl border-2 transition-all ${form.location_type === 'in-campus'
                                        ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/30 text-white'
                                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                        }`}>
                                    📍 In-Campus {form.location_type === 'in-campus' && '✓'}
                                </button>
                                <button type="button" onClick={() => setForm({ ...form, location_type: 'escrow' })}
                                    className={`flex-1 p-3 text-center text-sm rounded-xl border-2 transition-all ${form.location_type === 'escrow'
                                        ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/30 text-white'
                                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                        }`}>
                                    🛡️ Escrow {form.location_type === 'escrow' && '✓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                    )}

                    <button type="submit" className="btn-primary w-full py-3 mt-6 text-base"
                        disabled={loading || !form.title || !form.category} id="sell-submit">
                        {loading ? <span className="spinner mx-auto"></span> : (editingId ? 'Update Listing →' : 'List Product →')}
                    </button>
                </form>
            )}

            {/* My Listings */}
            <div>
                <h2 className="text-xl font-semibold mb-4">My Listings ({myListings.length})</h2>

                {loadingListings ? (
                    <div className="flex items-center justify-center py-12"><div className="spinner"></div></div>
                ) : myListings.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-white mb-2">No listings yet</h3>
                        <p className="text-sm mb-4">Create your first listing to start selling!</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">+ Create Listing</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myListings.map((product) => {
                            const badge = getTransactionBadge(product.transaction_type);
                            return (
                                <div key={product.id} className="card p-4 flex items-center gap-4" id={`listing-${product.id}`}>
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-lg bg-[var(--bg-secondary)] overflow-hidden shrink-0">
                                        {product.image_urls?.[0] ? (
                                            <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{product.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {product.price > 0 && (
                                                <span className="text-sm text-cyan-400 font-semibold">₹{product.price}</span>
                                            )}
                                            <span className={`badge text-xs ${badge.color}`}>{badge.label}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">{product.category}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleEdit(product)}
                                            className="px-3 py-2 rounded-lg text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => handleDelete(product.id)}
                                            className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

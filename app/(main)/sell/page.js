'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
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
    const user = getCurrentUser();

    const [form, setForm] = useState({
        title: '', description: '', price: '',
        transaction_type: 'cash', location_type: 'in-campus', category: '',
    });

    useEffect(() => { fetchMyListings(); }, []);

    const fetchMyListings = async () => {
        if (!user) return;
        const { data } = await supabase.from('products').select('*')
            .eq('seller_id', user.id).order('created_at', { ascending: false });
        setMyListings(data || []);
        setLoadingListings(false);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        setImageFiles(files);
        setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const resetForm = () => {
        setForm({ title: '', description: '', price: '', transaction_type: 'cash', location_type: 'in-campus', category: '' });
        setImageFiles([]); setImagePreviews([]); setEditingId(null); setShowForm(false); setError('');
    };

    const handleEdit = (product) => {
        setForm({
            title: product.title, description: product.description || '', price: product.price?.toString() || '',
            transaction_type: product.transaction_type || 'cash', location_type: product.location_type || 'in-campus',
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
        if (!user) return;

        let imageUrls = [];
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const ext = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
                if (uploadError) { setError('Image upload failed: ' + uploadError.message); }
                if (!uploadError && uploadData) {
                    const { data: urlData } = supabase.storage.from('products').getPublicUrl(uploadData.path);
                    imageUrls.push(urlData.publicUrl);
                }
            }
        }

        const productData = {
            title: form.title, description: form.description,
            price: form.transaction_type === 'swap' ? 0 : parseFloat(form.price) || 0,
            transaction_type: form.transaction_type, location_type: form.location_type, category: form.category,
        };
        if (imageUrls.length > 0) productData.image_urls = imageUrls;

        let result;
        if (editingId) {
            result = await supabase.from('products').update(productData).eq('id', editingId);
        } else {
            productData.seller_id = user.id;
            result = await supabase.from('products').insert(productData);
        }

        if (result.error) { setError(result.error.message); setLoading(false); return; }
        resetForm(); fetchMyListings(); setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold"><span className="neon-text">Sell</span></h1>
                    <p className="text-[var(--text-secondary)]">Manage your listings</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary" id="new-listing-btn">
                    {showForm ? '✕ Cancel' : '+ New Listing'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card p-6 mb-8">
                    <h3 className="font-semibold text-lg mb-4">{editingId ? '✏️ Edit Listing' : '📦 New Listing'}</h3>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Images <span className="text-xs">(up to 4)</span></label>
                            <div className="flex gap-3 flex-wrap">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)]">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--border-color)] flex items-center justify-center cursor-pointer hover:border-red-600/50 transition-colors">
                                    <span className="text-2xl text-[var(--text-secondary)]">+</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title *</label>
                            <input type="text" className="input" placeholder="What are you selling?" value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })} required id="sell-title" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                            <textarea className="input min-h-[100px] resize-y" placeholder="Describe your item..." value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })} id="sell-description" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label>
                            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                                <option value="">Select category</option>
                                <optgroup label="Products">{CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</optgroup>
                                <optgroup label="Services">{SERVICES.map((s) => (<option key={s} value={s}>{s}</option>))}</optgroup>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Transaction Type *</label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'cash', label: '💰', desc: 'Cash' },
                                    { value: 'swap', label: '🔄', desc: 'Swap' },
                                    { value: 'both', label: '🤝', desc: 'Both' },
                                ].map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => setForm({ ...form, transaction_type: opt.value })}
                                        className={`flex-1 p-3 text-center transition-all rounded-xl border-2 ${form.transaction_type === opt.value
                                            ? 'border-red-500 bg-red-600/20 ring-2 ring-red-600/30 text-white'
                                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                                        <div className="text-lg mb-1">{opt.label}</div>
                                        <div className="text-xs">{opt.desc}</div>
                                        {form.transaction_type === opt.value && <div className="text-xs text-red-500 mt-1">✓</div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.transaction_type !== 'swap' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Price (₹) *</label>
                                <input type="number" className="input" placeholder="Enter price" value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location</label>
                            <div className="flex gap-3">
                                {[{ v: 'in-campus', l: '📍 In-Campus' }, { v: 'escrow', l: '🛡️ Escrow' }].map((opt) => (
                                    <button key={opt.v} type="button" onClick={() => setForm({ ...form, location_type: opt.v })}
                                        className={`flex-1 p-3 text-center text-sm rounded-xl border-2 transition-all ${form.location_type === opt.v
                                            ? 'border-red-500 bg-red-600/20 ring-2 ring-red-600/30 text-white'
                                            : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                                        {opt.l} {form.location_type === opt.v && '✓'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

                    <button type="submit" className="btn-primary w-full py-3 mt-6" disabled={loading || !form.title || !form.category}>
                        {loading ? <span className="spinner mx-auto"></span> : (editingId ? 'Update →' : 'List Product →')}
                    </button>
                </form>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-4">My Listings ({myListings.length})</h2>
                {loadingListings ? (
                    <div className="flex justify-center py-12"><div className="spinner"></div></div>
                ) : myListings.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-white mb-2">No listings yet</h3>
                        <p className="text-sm mb-4">Create your first listing!</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">+ Create</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myListings.map((p) => {
                            const badge = getTransactionBadge(p.transaction_type);
                            return (
                                <div key={p.id} className="card p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-[var(--bg-secondary)] overflow-hidden shrink-0">
                                        {p.image_urls?.[0] ? <img src={p.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{p.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {p.price > 0 && <span className="text-sm text-red-500 font-semibold">₹{p.price}</span>}
                                            <span className={`badge text-xs ${badge.color}`}>{badge.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleEdit(p)} className="px-3 py-2 rounded-lg text-sm bg-red-600/10 text-red-500 hover:bg-red-600/20">✏️</button>
                                        <button onClick={() => handleDelete(p.id)} className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑️</button>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

export default function CommunityPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', description: '', category: 'looking-for' });
    const [editingPost, setEditingPost] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
    const [expandedPost, setExpandedPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const supabase = createClient();
    const router = useRouter();
    const user = getCurrentUser(); // Get current user directly

    useEffect(() => {
        fetchPosts(true);
        // getUser(); // Removed getUser call
    }, []);

    // const getUser = async () => { // Removed getUser function
    //     const { data: { user } } = await supabase.auth.getUser();
    //     setCurrentUser(user);
    // };

    const fetchPosts = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        const { data } = await supabase
            .from('community_posts')
            .select(`
        *,
        user:users(id, name, is_verified, avatar_url, role),
        comments:community_comments(
          id,
          comment,
          created_at,
          user:users(id, name)
        )
      `)
            .order('created_at', { ascending: false });

        setPosts(data || []);
        setLoading(false);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!user) return;

        await supabase.from('community_posts').insert({
            user_id: user.id,
            title: newPost.title,
            description: newPost.description,
            category: newPost.category,
        });

        setNewPost({ title: '', description: '', category: 'looking-for' });
        setShowCreate(false);
        // Optimistic: add post to top of list immediately
        const optimisticPost = {
            id: crypto.randomUUID(),
            user_id: user.id,
            title: newPost.title,
            description: newPost.description,
            category: newPost.category,
            upvotes: 0,
            created_at: new Date().toISOString(),
            user: { id: user.id, name: user.name, is_verified: user.is_verified },
            comments: [],
        };
        setPosts((prev) => [optimisticPost, ...prev]);
        // Sync to DB in background
        await supabase.from('community_posts').insert({
            user_id: user.id,
            title: newPost.title,
            description: newPost.description,
            category: newPost.category,
        });
        fetchPosts(); // Re-fetch to get real IDs
    };

    const handleUpvote = async (postId) => {
        // Optimistic update
        setPosts((prev) =>
            prev.map((p) => p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p)
        );
        await supabase
            .from('community_posts')
            .update({ upvotes: (posts.find(p => p.id === postId)?.upvotes || 0) + 1 })
            .eq('id', postId);
    };

    const handleComment = async (postId) => {
        if (!newComment.trim() || !user) return;
        const commentText = newComment.trim();
        setNewComment('');
        // Optimistic: add comment to the post immediately
        const optimisticComment = {
            id: crypto.randomUUID(),
            comment: commentText,
            created_at: new Date().toISOString(),
            user: { id: user.id, name: user.name },
        };
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, comments: [...(p.comments || []), optimisticComment] }
                    : p
            )
        );
        await supabase.from('community_comments').insert({
            post_id: postId,
            user_id: user.id,
            comment: commentText,
        });
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Delete this post?')) return;
        // Optimistic: remove from list immediately
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        await supabase.from('community_posts').delete().eq('id', postId);
    };

    const startEditPost = (post) => {
        setEditingPost(post.id);
        setEditForm({ title: post.title, description: post.description || '', category: post.category });
    };

    const handleSaveEdit = async (postId) => {
        // Optimistic: update in list immediately
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, title: editForm.title, description: editForm.description, category: editForm.category }
                    : p
            )
        );
        setEditingPost(null);
        await supabase.from('community_posts').update({
            title: editForm.title,
            description: editForm.description,
            category: editForm.category,
        }).eq('id', postId);
    };

    const handleDM = async (postAuthorId) => {
        if (!user || user.id === postAuthorId) return;

        // Check for existing DM chat (no product)
        const { data: existing } = await supabase
            .from('chats')
            .select('id')
            .is('product_id', null)
            .or(`and(buyer_id.eq.${user.id},seller_id.eq.${postAuthorId}),and(buyer_id.eq.${postAuthorId},seller_id.eq.${user.id})`)
            .single();

        if (existing) {
            router.push(`/chat/${existing.id}`);
            return;
        }

        // Create new DM chat
        const { data: newChat } = await supabase
            .from('chats')
            .insert({
                product_id: null,
                buyer_id: user.id,
                seller_id: postAuthorId,
            })
            .select()
            .single();

        if (newChat) {
            router.push(`/chat/${newChat.id}`);
        }
    };

    const categoryColors = {
        'looking-for': 'bg-red-600/20 text-red-500',
        'offering': 'bg-green-500/20 text-green-400',
        'question': 'bg-red-700/20 text-red-500',
        'discussion': 'bg-orange-500/20 text-orange-400',
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="neon-text">Community</span>
                    </h1>
                    <p className="text-[var(--text-secondary)]">Campus requests, discussions & more</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="btn-primary"
                    id="create-post-btn"
                >
                    ✍️ New Post
                </button>
            </div>

            {/* Create post */}
            {showCreate && (
                <form onSubmit={handleCreatePost} className="card p-6 mb-6">
                    <h3 className="font-semibold mb-4">Create a Post</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            className="input"
                            placeholder="Post title..."
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            required
                            id="post-title"
                        />
                        <textarea
                            className="input min-h-[80px] resize-y"
                            placeholder="What are you looking for or offering?"
                            value={newPost.description}
                            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                            id="post-description"
                        />
                        <select
                            className="input"
                            value={newPost.category}
                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                            id="post-category"
                        >
                            <option value="looking-for">🔍 Looking For</option>
                            <option value="offering">🎁 Offering</option>
                            <option value="question">❓ Question</option>
                            <option value="discussion">💭 Discussion</option>
                        </select>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary flex-1" id="submit-post">
                                Post →
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Posts */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner"></div></div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-secondary)]">
                    <div className="text-5xl mb-4">🌐</div>
                    <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                    <p className="text-sm">Be the first to start a conversation!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="card p-5" id={`post-${post.id}`}>
                            {/* Post header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-bold text-black">
                                    {post.user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{post.user?.name}</span>
                                        {post.user?.is_verified && (
                                            <span className="text-xs text-green-400">✓</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">{timeAgo(post.created_at)}</span>
                                </div>
                                <span className={`badge text-xs ${categoryColors[post.category] || 'bg-gray-500/20 text-gray-400'}`}>
                                    {post.category?.replace('-', ' ')}
                                </span>
                            </div>

                            {/* Post content */}
                            {editingPost === post.id ? (
                                <div className="space-y-3 mb-3">
                                    <input
                                        type="text"
                                        className="input"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                    <textarea
                                        className="input min-h-[60px] resize-y"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                    <select
                                        className="input"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    >
                                        <option value="looking-for">🔍 Looking For</option>
                                        <option value="offering">🎁 Offering</option>
                                        <option value="question">❓ Question</option>
                                        <option value="discussion">💭 Discussion</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingPost(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                                        <button onClick={() => handleSaveEdit(post.id)} className="btn-primary flex-1 text-sm">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                                    {post.description && (
                                        <p className="text-sm text-[var(--text-secondary)] mb-3 whitespace-pre-wrap">
                                            {post.description}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 text-sm">
                                <button
                                    onClick={() => handleUpvote(post.id)}
                                    className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                                >
                                    ▲ <span>{post.upvotes || 0}</span>
                                </button>
                                <button
                                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                    className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    💬 <span>{post.comments?.length || 0} comments</span>
                                </button>
                                {user && user.id !== post.user_id && (
                                    <button
                                        onClick={() => handleDM(post.user_id)}
                                        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors ml-auto"
                                    >
                                        ✉️ <span>Message</span>
                                    </button>
                                )}
                                {user && user.id === post.user_id && (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button
                                            onClick={() => startEditPost(post)}
                                            className="text-[var(--text-secondary)] hover:text-yellow-400 transition-colors text-xs"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-[var(--text-secondary)] hover:text-red-400 transition-colors text-xs"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Comments */}
                            {expandedPost === post.id && (
                                <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
                                    {post.comments?.map((comment) => (
                                        <div key={comment.id} className="bg-[#111113] rounded-xl p-4 border border-[#1c1c1f] hover:border-[#2a2a2d] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[10px] font-bold text-white">
                                                        {comment.user?.name?.[0]?.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm font-semibold text-white">{comment.user?.name}</span>
                                                </div>
                                                <span className="text-[10px] text-[#555] tracking-wide">{timeAgo(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-[#A1A1AA] leading-relaxed pl-9">{comment.comment}</p>
                                        </div>
                                    ))}

                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="text"
                                            className="input flex-1 text-sm"
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                        />
                                        <button
                                            onClick={() => handleComment(post.id)}
                                            className="btn-primary text-sm px-5"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

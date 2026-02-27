'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

export default function CommunityPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', description: '', category: 'looking-for' });
    // const [currentUser, setCurrentUser] = useState(null); // Removed currentUser state
    const [expandedPost, setExpandedPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const supabase = createClient();
    const user = getCurrentUser(); // Get current user directly

    useEffect(() => {
        fetchPosts();
        // getUser(); // Removed getUser call
    }, []);

    // const getUser = async () => { // Removed getUser function
    //     const { data: { user } } = await supabase.auth.getUser();
    //     setCurrentUser(user);
    // };

    const fetchPosts = async () => {
        setLoading(true); // Added setLoading(true)
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
        fetchPosts();
    };

    const handleUpvote = async (postId) => {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        await supabase
            .from('community_posts')
            .update({ upvotes: (post.upvotes || 0) + 1 })
            .eq('id', postId);

        fetchPosts();
    };

    const handleComment = async (postId) => {
        if (!newComment.trim() || !user) return;

        await supabase.from('community_comments').insert({
            post_id: postId,
            user_id: user.id,
            comment: newComment.trim(),
        });

        setNewComment('');
        fetchPosts();
    };

    const categoryColors = {
        'looking-for': 'bg-blue-500/20 text-blue-400',
        'offering': 'bg-green-500/20 text-green-400',
        'question': 'bg-purple-500/20 text-purple-400',
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
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-black">
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
                            <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                            {post.description && (
                                <p className="text-sm text-[var(--text-secondary)] mb-3 whitespace-pre-wrap">
                                    {post.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 text-sm">
                                <button
                                    onClick={() => handleUpvote(post.id)}
                                    className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
                                >
                                    ▲ <span>{post.upvotes || 0}</span>
                                </button>
                                <button
                                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                    className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    💬 <span>{post.comments?.length || 0} comments</span>
                                </button>
                            </div>

                            {/* Comments */}
                            {expandedPost === post.id && (
                                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                    {post.comments?.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs shrink-0">
                                                {comment.user?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{comment.user?.name}</span>
                                                    <span className="text-xs text-[var(--text-secondary)]">{timeAgo(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)]">{comment.comment}</p>
                                            </div>
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
                                            className="btn-primary text-sm px-4"
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

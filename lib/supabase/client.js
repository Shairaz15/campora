'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return a mock during build/prerender if not configured
  if (!url || url === 'YOUR_SUPABASE_URL_HERE' || !key || key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithOtp: async () => ({ error: { message: 'Supabase not configured' } }),
        verifyOtp: async () => ({ error: { message: 'Supabase not configured' } }),
        signOut: async () => ({}),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null }), data: [], order: () => ({ data: [] }) }), single: async () => ({ data: null }), data: [], order: () => ({ data: [] }) }), single: async () => ({ data: null }), data: [], order: () => ({ data: [] }), not: () => ({ eq: () => ({ data: [], count: 0 }) }), or: () => ({ order: () => ({ data: [] }) }) }), data: [], count: 0, order: () => ({ data: [] }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null }) }), error: null }),
        update: () => ({ eq: () => ({ error: null }) }),
        upsert: () => ({ error: null }),
        delete: () => ({ eq: () => ({ error: null }) }),
      }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
      removeChannel: () => { },
    };
  }

  return createBrowserClient(url, key);
}

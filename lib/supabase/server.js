import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return a mock during build if not configured
    if (!url || url === 'YOUR_SUPABASE_URL_HERE' || !key || key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                exchangeCodeForSession: async () => ({ error: { message: 'Supabase not configured' } }),
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
            }),
        };
    }

    const cookieStore = await cookies();

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Server Component — ignore
                }
            },
        },
    });
}

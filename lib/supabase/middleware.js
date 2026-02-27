import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/utils';

export async function updateSession(request) {
    // Skip if Supabase is not configured
    if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE'
    ) {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ['/login', '/signup', '/auth/callback', '/'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route);

    // Not logged in → redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Logged in on auth pages → redirect to marketplace
    if (user && (pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/marketplace';
        return NextResponse.redirect(url);
    }

    // Admin route: check by email only (no DB query = fast!)
    if (pathname.startsWith('/admin')) {
        if (!user || user.email !== ADMIN_EMAIL) {
            const url = request.nextUrl.clone();
            url.pathname = user ? '/marketplace' : '/login';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

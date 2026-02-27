import { NextResponse } from 'next/server';

// Hardcoded user IDs for cookie-based auth
const USERS = {
    '00000000-0000-0000-0000-000000000001': 'admin',
    '00000000-0000-0000-0000-000000000002': 'student',
    '00000000-0000-0000-0000-000000000003': 'student',
};

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public routes
    const publicRoutes = ['/', '/login'];
    if (publicRoutes.includes(pathname)) {
        // If logged in and trying to access login, redirect to marketplace
        const userId = request.cookies.get('campora_user')?.value;
        if (userId && USERS[userId] && (pathname === '/login')) {
            const url = request.nextUrl.clone();
            url.pathname = '/marketplace';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // Check auth cookie
    const userId = request.cookies.get('campora_user')?.value;

    if (!userId || !USERS[userId]) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Admin routes: only admin users
    if (pathname.startsWith('/admin')) {
        if (USERS[userId] !== 'admin') {
            const url = request.nextUrl.clone();
            url.pathname = '/marketplace';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

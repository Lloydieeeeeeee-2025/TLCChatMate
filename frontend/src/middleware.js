import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('session');
    const { pathname } = request.nextUrl;

    // Protected routes
    const protectedPaths = [
        '/admin/course',
        '/admin/handbook',
        '/admin/faqs',
        '/admin/url',
        '/admin/users',
    ];

    // Specific check for protected paths
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // Public pages which should not require login
    // / and /student/faqs

    if (isProtectedPath && !session) {
        // Redirect to login page if no session cookie exists
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, favicon.webp (favicon files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.webp).*)',
    ],
};

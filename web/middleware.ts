import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Protect all routes except auth pages and auth API.
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  if (
    pathname === '/' ||
    pathname.startsWith('/(auth)') ||
    pathname.startsWith('/log-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forget-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email')
  ) {
    return NextResponse.next();
  }
  const hasSessionCookie = getSessionCookie(req);
  if (hasSessionCookie) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/log-in';
  url.searchParams.set(
    'callbackURL',
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

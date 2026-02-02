import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getExpectedTokenEdge, AUTH_COOKIE_NAME } from '@/lib/auth-edge';

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/api/dashboard'];
const LOGIN_PATH = '/login';

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthRoute(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname.startsWith('/api/auth/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expectedToken = await getExpectedTokenEdge();

  if (!expectedToken || cookieToken !== expectedToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/dashboard', '/login', '/api/auth/:path*'],
};

import { NextRequest, NextResponse } from 'next/server';

const roleAccess = {
  '/manager': ['manager', 'admin'],
  '/admin': ['admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedEntry = Object.entries(roleAccess).find(([prefix]) => pathname.startsWith(prefix));
  if (!protectedEntry) return NextResponse.next();

  const role = request.cookies.get('nexus-role')?.value ?? request.cookies.get('nexus-demo-role')?.value;
  const userId = request.cookies.get('nexus-user-id')?.value;
  const [, allowedRoles] = protectedEntry;

  if (!role || !userId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!allowedRoles.includes(role)) {
    const homeUrl = new URL('/', request.url);
    homeUrl.searchParams.set('accessDenied', pathname.startsWith('/admin') ? 'admin' : 'manager');
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manager/:path*', '/admin/:path*'],
};

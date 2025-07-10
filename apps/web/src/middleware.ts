import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Subdomain-based routing for Vercel domains
  if (hostname.includes('tap2go-vendor.vercel.app')) {
    // Handle root path - redirect to vendor auth
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/vendor/auth/signin', request.url));
    }
    // Rewrite all other paths to vendor routes
    if (!pathname.startsWith('/vendor')) {
      return NextResponse.rewrite(new URL(`/vendor${pathname}`, request.url));
    }
  }

  if (hostname.includes('tap2go-admin.vercel.app')) {
    // Handle root path - redirect to admin auth
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/auth/signin', request.url));
    }
    // Rewrite all other paths to admin routes
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }

  if (hostname.includes('tap2go-driver.vercel.app')) {
    // Handle root path - redirect to driver auth
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/driver/auth/signin', request.url));
    }
    // Rewrite all other paths to driver routes
    if (!pathname.startsWith('/driver')) {
      return NextResponse.rewrite(new URL(`/driver${pathname}`, request.url));
    }
  }

  // Subdomain-based routing for custom domains (future)
  if (hostname.startsWith('vendor.')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/vendor/auth/signin', request.url));
    }
    if (!pathname.startsWith('/vendor')) {
      return NextResponse.rewrite(new URL(`/vendor${pathname}`, request.url));
    }
  }

  if (hostname.startsWith('admin.')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/auth/signin', request.url));
    }
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }

  if (hostname.startsWith('driver.')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/driver/auth/signin', request.url));
    }
    if (!pathname.startsWith('/driver')) {
      return NextResponse.rewrite(new URL(`/driver${pathname}`, request.url));
    }
  }

  // Check if this is a test route
  if (pathname.startsWith('/tests/') || pathname.startsWith('/test-')) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const enableTestRoutes = process.env.ENABLE_TEST_ROUTES === 'true';

    // Only allow test routes in development with explicit enablement
    if (!isDevelopment || !enableTestRoutes) {
      // Redirect to home page in production or when tests are disabled
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    '/tests/:path*',
    '/test-:path*',
  ],
};

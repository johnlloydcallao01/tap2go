import { get } from '@vercel/edge-config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.webp (logo file)
     * - maintenance (the maintenance page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.webp|maintenance).*)',
  ],
};

export async function proxy(req: NextRequest) {
  // 1. Skip if it's already the maintenance page (handled by matcher, but good to be safe)
  if (req.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.next();
  }

  // 2. Check Maintenance Mode
  try {
    const isInMaintenanceMode = await checkMaintenanceMode();
    
    if (isInMaintenanceMode) {
      // In Next.js Proxy, we can rewrite just like in Middleware
      const url = req.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error('Maintenance check failed:', error);
    // Fail open: allow traffic if check fails
  }

  return NextResponse.next();
}

async function checkMaintenanceMode() {
  // Check for local development override
  if (process.env.NODE_ENV === 'development') {
    return process.env.LOCAL_MAINTENANCE_MODE === 'true';
  }

  // Check Vercel Edge Config
  try {
    const maintenance = await get('isInMaintenanceMode');
    return maintenance === true;
  } catch (error) {
    // If EDGE_CONFIG is not set or other error, log and return false
    console.error('Edge Config Error:', error);
    return false;
  }
}

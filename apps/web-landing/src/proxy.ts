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

export default async function proxy(req: NextRequest) {
  // 1. Skip if it's already the maintenance page (handled by matcher, but good to be safe)
  if (req.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.next();
  }

  // 2. Check Maintenance Mode
  try {
    const isInMaintenanceMode = await checkMaintenanceMode();
    
    // Log for debugging in Vercel Logs
    if (process.env.NODE_ENV === 'production') {
      console.log(`[Proxy] Checking maintenance mode: ${isInMaintenanceMode}`);
    }

    if (isInMaintenanceMode) {
      const url = req.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    console.error('[Proxy] Maintenance check failed:', error);
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
    if (!process.env.EDGE_CONFIG) {
      console.warn('[Proxy] EDGE_CONFIG env var is missing!');
      return false;
    }
    const maintenance = await get('isInMaintenanceMode');
    return maintenance === true;
  } catch (error) {
    console.error('[Proxy] Edge Config Error:', error);
    return false;
  }
}

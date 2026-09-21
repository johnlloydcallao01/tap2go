import { NextRequest, NextResponse } from 'next/server';

const CMS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-admin-token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], totalCount: 0, query: q ?? '' });
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Unified CMS search (single auth, bounded per-collection queries, cached).
    // See apps/cms/src/app/api/admin/search/route.ts + performance.md §23.
    const res = await fetch(`${CMS_BASE}/admin/search?${searchParams.toString()}`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.text();
    const headers = new Headers({ 'Content-Type': res.headers.get('content-type') || 'application/json' });
    const cacheStatus = res.headers.get('X-Search-Cache');
    if (cacheStatus) headers.set('X-Search-Cache', cacheStatus);
    headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return new NextResponse(data, { status: res.status, headers });
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 });
  }
}

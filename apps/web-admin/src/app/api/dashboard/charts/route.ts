import { NextRequest, NextResponse } from 'next/server';

const CMS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-admin-token';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${CMS_BASE}/admin/dashboard/charts`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      await res.text();
      return NextResponse.json({ error: 'Failed to load dashboard charts' }, { status: res.status });
    }

    const data = await res.json();
    const response = NextResponse.json(data);
    const cacheStatus = res.headers.get('X-Dashboard-Cache');
    if (cacheStatus) response.headers.set('X-Dashboard-Cache', cacheStatus);
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 });
  }
}

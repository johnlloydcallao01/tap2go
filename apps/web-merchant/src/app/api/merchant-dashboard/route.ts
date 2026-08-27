import { NextRequest, NextResponse } from 'next/server';

const CMS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-merchant-token';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Resolve the authenticated user (same as getServerUser in auth actions)
    const meRes = await fetch(`${CMS_BASE}/users/me?depth=2`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    });
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const meData = await meRes.json();
    const user = meData?.user;
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }

    // 2. Fetch dashboard data — CMS endpoint resolves vendor internally with overrideAccess
    const dashboardRes = await fetch(`${CMS_BASE}/merchant/dashboard?userId=${user.id}`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    });
    if (!dashboardRes.ok) {
      return NextResponse.json({ error: 'Failed to load dashboard' }, { status: dashboardRes.status });
    }

    const data = await dashboardRes.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 });
  }
}

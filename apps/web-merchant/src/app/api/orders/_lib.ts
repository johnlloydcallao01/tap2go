import { NextRequest, NextResponse } from 'next/server'

export const CMS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '')
const AUTH_COOKIE = 'tap2go-merchant-token'

type VendorAuthResult =
  | { token: string; error: null }
  | { token: null; error: NextResponse }

export async function authenticateVendorProxy(request: NextRequest): Promise<VendorAuthResult> {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) {
    return { token: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  try {
    const response = await fetch(`${CMS_BASE}/users/me?depth=0`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    })
    if (!response.ok) {
      return { token: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    const result = await response.json()
    const user = result?.user
    if (!user || user.role !== 'vendor' || user.isActive === false) {
      return { token: null, error: NextResponse.json({ error: 'Vendor access required' }, { status: 403 }) }
    }
    return { token, error: null }
  } catch {
    return { token: null, error: NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 }) }
  }
}

export async function proxyOrderRequest(
  token: string,
  path: string,
  options: { method?: string; body?: string } = {},
): Promise<NextResponse> {
  const response = await fetch(`${CMS_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `JWT ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body,
    cache: 'no-store',
  })
  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
  })
}

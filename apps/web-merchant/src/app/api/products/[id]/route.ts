import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CMS_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '')
const AUTH_COOKIE = 'tap2go-merchant-token'

async function authenticateVendorProxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (!token) return { token: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  try {
    const response = await fetch(`${CMS_BASE}/users/me?depth=0`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    })
    if (!response.ok) return { token: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    const data = await response.json()
    if (data?.user?.role !== 'vendor') {
      return { token: null, error: NextResponse.json({ error: 'Vendor access required' }, { status: 403 }) }
    }
    return { token, error: null }
  } catch {
    return { token: null, error: NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 }) }
  }
}

async function proxyProductRequest(
  request: NextRequest,
  params: Promise<{ id: string }>,
  method: 'GET' | 'PATCH',
) {
  const { token, error } = await authenticateVendorProxy(request)
  if (error) return error
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!/^[1-9]\d*$/.test(id)) return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })

  try {
    const options: RequestInit = {
      method,
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    }
    if (method === 'PATCH') {
      let body: unknown
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
      }
      options.headers = { ...options.headers, 'Content-Type': 'application/json' }
      options.body = JSON.stringify(body)
    }
    const response = await fetch(`${CMS_BASE}/vendor/products/${id}`, options)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyProductRequest(request, params, 'GET')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyProductRequest(request, params, 'PATCH')
}

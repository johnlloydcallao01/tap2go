import { NextRequest, NextResponse } from 'next/server'
import { authenticateVendorProxy, proxyOrderRequest } from './_lib'

export const dynamic = 'force-dynamic'

// GET /api/orders -> vendor-scoped orders across the vendor's outlets.
export async function GET(request: NextRequest) {
  const { token, error } = await authenticateVendorProxy(request)
  if (error) return error
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const qs = new URLSearchParams()
    for (const k of ['search', 'sort', 'page', 'limit', 'status', 'fulfillment_type', 'fulfillmentType', 'delivery_status', 'deliveryStatus', 'has_discount']) {
      const v = searchParams.get(k)
      if (v != null && v !== '') qs.set(k, v)
    }
    const query = qs.toString()
    return await proxyOrderRequest(token, `/vendor/orders${query ? `?${query}` : ''}`)
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const { token, error } = await authenticateVendorProxy(request)
  if (error) return error
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: string
  try {
    body = JSON.stringify(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    return await proxyOrderRequest(token, '/vendor/orders', { method: 'POST', body })
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 })
  }
}
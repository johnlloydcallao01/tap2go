import { NextRequest, NextResponse } from 'next/server'
import { authenticateVendorProxy, proxyOrderRequest } from '../_lib'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

async function forward(
  request: NextRequest,
  { params }: RouteContext,
  method: 'GET' | 'PATCH' | 'DELETE',
) {
  const { token, error } = await authenticateVendorProxy(request)
  if (error) return error
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })

  let body: string | undefined
  if (method === 'PATCH') {
    try {
      body = JSON.stringify(await request.json())
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  }

  try {
    const refresh = method === 'GET' && new URL(request.url).searchParams.get('refresh') === 'true'
      ? '?refresh=true'
      : ''
    return await proxyOrderRequest(token, `/vendor/orders/${encodeURIComponent(id)}${refresh}`, { method, body })
  } catch {
    return NextResponse.json({ error: 'Failed to reach CMS' }, { status: 502 })
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'GET')
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'PATCH')
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context, 'DELETE')
}

import type { PayloadRequest } from 'payload'

function parseId(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function authorized(req: PayloadRequest): boolean {
  return req.user?.role === 'service' || req.user?.role === 'admin'
}

function authError(req: PayloadRequest): Response | null {
  if (!req.user) {
    return Response.json(
      { success: false, error: 'Authentication required.', code: 'UNAUTHENTICATED' },
      { status: 401 },
    )
  }
  if (!authorized(req)) {
    return Response.json(
      { success: false, error: 'Service or admin role required.', code: 'INSUFFICIENT_PERMISSIONS' },
      { status: 403 },
    )
  }
  return null
}

export const merchantViewHandler = async (req: PayloadRequest) => {
  const unauthorized = authError(req)
  if (unauthorized) return unauthorized

  const { merchantId: merchantIdParam } = req.query as { merchantId?: string }
  const merchantId = parseId(merchantIdParam)
  if (!merchantId) {
    return Response.json(
      { success: false, error: 'Invalid merchantId.', code: 'INVALID_PARAMETER' },
      { status: 400 },
    )
  }

  try {
    const merchant = await req.payload.findByID({
      collection: 'merchants',
      id: merchantId,
      depth: 2,
      context: { skipStoreHours: true },
      select: {
        id: true,
        outletName: true,
        isActive: true,
        isAcceptingOrders: true,
        vacationMode: true,
        vacationModeEndsAt: true,
        timezone: true,
        vendor: true,
        media: true,
        activeAddress: true,
      },
    })
    return Response.json(
      { success: true, data: merchant },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.toLowerCase().includes('not found')) {
      return Response.json(
        { success: false, error: 'Merchant not found.', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    console.error('[merchant-view] failed to load merchant', { merchantId, message })
    return Response.json(
      { success: false, error: 'Failed to load merchant.', code: 'MERCHANT_VIEW_ERROR' },
      { status: 500 },
    )
  }
}

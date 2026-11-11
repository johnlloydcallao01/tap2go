import type { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { getOrBuildDashboard } from '../utils/dashboardCache'
import { buildMerchantMenuPage } from '../services/merchantMenuService'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

function parsePositiveInteger(value: string | undefined, fallback: number): number | null {
  if (value === undefined) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export const merchantMenuHandler = async (req: PayloadRequest) => {
  const startedAt = Date.now()
  const requestId = crypto.randomUUID()
  const respond = (body: unknown, status: number, cacheStatus?: string) => {
    const headers: Record<string, string> = { 'Cache-Control': 'private, no-store' }
    if (cacheStatus) headers['X-Customer-Merchant-Menu-Cache'] = cacheStatus
    console.info('[customer-merchant-menu] timing', {
      requestId,
      durationMs: Date.now() - startedAt,
      status,
      cacheStatus,
    })
    return Response.json(body, { status, headers })
  }

  if (!req.user) {
    return respond(
      { success: false, error: 'Authentication required.', code: 'UNAUTHENTICATED', requestId },
      401,
    )
  }
  if (req.user.role !== 'service' && req.user.role !== 'admin') {
    return respond(
      { success: false, error: 'Service or admin role required.', code: 'INSUFFICIENT_PERMISSIONS', requestId },
      403,
    )
  }

  const { merchantId: merchantIdParam, page: pageParam, limit: limitParam, refresh } = req.query as {
    merchantId?: string
    page?: string
    limit?: string
    refresh?: string
  }
  const merchantId = parsePositiveInteger(merchantIdParam, 0)
  const page = parsePositiveInteger(pageParam, 1)
  const requestedLimit = parsePositiveInteger(limitParam, DEFAULT_LIMIT)
  if (!merchantId || !page || !requestedLimit) {
    return respond(
      { success: false, error: 'Invalid merchantId, page, or limit.', code: 'INVALID_PARAMETER', requestId },
      400,
    )
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT)
  const cacheKey = `customer:merchant:menu:v1:${merchantId}:${page}:${limit}`
  try {
    const { data, status: cacheStatus } = await getOrBuildDashboard(
      cacheKey,
      30,
      () => buildMerchantMenuPage(req.payload, merchantId, page, limit),
      { bypassCache: refresh === 'true', awaitRedisWrite: false },
    )
    return respond(
      {
        success: true,
        data,
        metadata: { requestId, responseTime: Date.now() - startedAt, cacheStatus },
      },
      200,
      cacheStatus,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[customer-merchant-menu] failed to load menu', {
      requestId,
      durationMs: Date.now() - startedAt,
      message,
    })
    return respond(
      {
        success: false,
        error: 'Failed to load merchant menu.',
        code: 'MERCHANT_MENU_ERROR',
        requestId,
      },
      500,
    )
  }
}

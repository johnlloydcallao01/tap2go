import type { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { CustomerHomeService } from '../services/CustomerHomeService'
import { getOrBuildDashboard } from '../utils/dashboardCache'

export const customerHomeOverviewHandler = async (req: PayloadRequest) => {
  const startTime = Date.now()
  const requestedId = req.headers.get('x-request-id')
  const requestId =
    requestedId && /^[a-zA-Z0-9_-]{1,64}$/.test(requestedId) ? requestedId : crypto.randomUUID()
  const logTotalHandlerTime = (status: number) => {
    console.info('[customer-home-overview] timing', {
      requestId,
      phase: 'handler_total_after_framework_auth',
      durationMs: Date.now() - startTime,
      status,
    })
  }
  const logPhaseTiming = (phase: string, durationMs: number, counts?: Record<string, number>) => {
    phaseTimings.push({ phase, durationMs, ...counts })
    console.info('[customer-home-overview] timing', {
      requestId,
      phase,
      durationMs,
      ...counts,
    })
  }
  const phaseTimings: Array<{ phase: string; durationMs: number; [key: string]: string | number }> = []
  const respond = (body: unknown, status: number) => {
    const response = Response.json(body, { status })
    logTotalHandlerTime(status)
    return response
  }

  try {
    // PayloadCMS built-in API key authentication
    // PayloadCMS automatically authenticates API keys and populates req.user
    if (!req.user) {
      return respond({
        success: false,
        error: 'Authentication required. Please provide a valid API key in the format: Authorization: users API-Key <your-key>',
        code: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
        requestId,
        hint: 'Use header format: Authorization: users API-Key <your-api-key>'
      }, 401)
    }

    // Verify user has service or admin role
    if (req.user.role !== 'service' && req.user.role !== 'admin') {
      return respond({
        success: false,
        error: 'Access denied. Service or admin role required.',
        code: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString(),
        requestId,
        userRole: req.user.role,
      }, 403)
    }

    // Extract and validate query parameters
    const { customerId, limit, categoryId, section, refresh } = req.query as {
      customerId?: string
      limit?: string
      categoryId?: string
      section?: string
      refresh?: string
    }

    // Validation
    if (!customerId) {
      return respond({
        success: false,
        error: 'Missing required parameter: customerId',
        code: 'MISSING_PARAMETERS',
        timestamp: new Date().toISOString(),
        requestId,
      }, 400)
    }

    const customerIdNum = parseInt(customerId, 10)

    if (isNaN(customerIdNum)) {
      return respond({
        success: false,
        error: 'Invalid customerId. Must be a valid number.',
        code: 'INVALID_PARAMETER',
        timestamp: new Date().toISOString(),
        requestId,
      }, 400)
    }

    if (
      section !== undefined &&
      section !== 'all' &&
      section !== 'primary' &&
      section !== 'recommendations'
    ) {
      return respond({
        success: false,
        error: 'Invalid section. Expected all, primary, or recommendations.',
        code: 'INVALID_PARAMETER',
        timestamp: new Date().toISOString(),
        requestId,
      }, 400)
    }

    // BFF aggregation: one call resolves customer → address → merchants,
    // categories, recommended products and address names.
    const parsedLimit = limit ? parseInt(limit, 10) : 20
    const normalizedLimit = Math.min(Math.max(parsedLimit || 20, 1), 50)
    const normalizedSection = (section || 'all') as 'all' | 'primary' | 'recommendations'
    const cacheKey = [
      'customer:home-overview:v1',
      customerIdNum,
      normalizedLimit,
      categoryId || 'all',
      normalizedSection,
    ].join(':')
    const { data: result, status: cacheStatus } = await getOrBuildDashboard(
      cacheKey,
      30,
      () =>
        new CustomerHomeService(req.payload).buildCustomerHomeOverview(
          {
            customerId: customerIdNum,
            limit: normalizedLimit,
            categoryId: categoryId || undefined,
            section: normalizedSection,
            forceRefresh: refresh === 'true',
          },
          logPhaseTiming,
        ),
      { bypassCache: refresh === 'true', awaitRedisWrite: false },
    )

    const responseTime = Date.now() - startTime

    if (responseTime > 5000) {
      console.warn('[customer-home-overview] slow post-auth handler', {
        requestId,
        durationMs: responseTime,
      })
    }

    const response = Response.json({
      success: true,
      data: result,
      filters: { categoryId: categoryId || null, applied: !!categoryId },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        responseTime,
        merchantCount: result.nearbyMerchants?.length || 0,
        cacheStatus,
        phaseTimings,
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Customer-Home-Cache': cacheStatus,
      },
    })
    logTotalHandlerTime(200)
    return response
  } catch (error) {
    const responseTime = Date.now() - startTime
    const message = error instanceof Error ? error.message : 'Unknown error'

    let errorCode = 'INTERNAL_SERVER_ERROR'
    if (message.includes('Customer not found') || message.includes('no active address') || message.includes('Address')) {
      errorCode = 'CUSTOMER_DATA_ERROR'
    } else if (message.includes('pool') || message.includes('connect')) {
      errorCode = 'DATABASE_CONNECTION_ERROR'
    }

    const response = Response.json({
      success: false,
      error: 'Failed to fetch customer home overview',
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      responseTime,
    }, { status: 500 })
    logTotalHandlerTime(500)

    if (responseTime > 10000) {
      console.warn('[customer-home-overview] slow failing post-auth handler', {
        requestId,
        durationMs: responseTime,
      })
    }

    return response
  }
}

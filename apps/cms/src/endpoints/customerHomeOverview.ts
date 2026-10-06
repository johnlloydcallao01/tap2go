import type { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { CustomerHomeService } from '../services/CustomerHomeService'

export const customerHomeOverviewHandler = async (req: PayloadRequest) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    console.log(`🏠 [${requestId}] CUSTOMER HOME OVERVIEW REQUEST:`, {
      timestamp: new Date().toISOString(),
      query: req.query,
    })

    // PayloadCMS built-in API key authentication
    // PayloadCMS automatically authenticates API keys and populates req.user
    if (!req.user) {
      console.log(`❌ [${requestId}] Authentication failed - no user found`)

      return Response.json({
        success: false,
        error: 'Authentication required. Please provide a valid API key in the format: Authorization: users API-Key <your-key>',
        code: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
        requestId,
        hint: 'Use header format: Authorization: users API-Key <your-api-key>'
      }, { status: 401 })
    }

    // Verify user has service or admin role
    if (req.user.role !== 'service' && req.user.role !== 'admin') {
      console.log(`❌ [${requestId}] Access denied - user role: ${req.user.role}`)

      return Response.json({
        success: false,
        error: 'Access denied. Service or admin role required.',
        code: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString(),
        requestId,
        userRole: req.user.role
      }, { status: 403 })
    }

    console.log(`✅ [${requestId}] Authentication successful - user: ${req.user.id}, role: ${req.user.role}`)

    // Extract and validate query parameters
    const { customerId, limit, categoryId } = req.query as {
      customerId?: string
      limit?: string
      categoryId?: string
    }

    // Validation
    if (!customerId) {
      console.log(`❌ [${requestId}] Missing customerId parameter`)

      return Response.json({
        success: false,
        error: 'Missing required parameter: customerId',
        code: 'MISSING_PARAMETERS',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    const customerIdNum = parseInt(customerId, 10)

    if (isNaN(customerIdNum)) {
      console.log(`❌ [${requestId}] Invalid customerId parameter: ${customerId}`)

      return Response.json({
        success: false,
        error: 'Invalid customerId. Must be a valid number.',
        code: 'INVALID_PARAMETER',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    // BFF aggregation: one call resolves customer → address → merchants,
    // categories, recommended products and address names.
    const customerHomeService = new CustomerHomeService(req.payload)
    const result = await customerHomeService.buildCustomerHomeOverview({
      customerId: customerIdNum,
      limit: limit ? parseInt(limit, 10) : 20,
      categoryId: categoryId || undefined,
    })

    const responseTime = Date.now() - startTime

    if (responseTime > 5000) {
      console.warn(`⚠️ [${requestId}] Slow home overview query: ${responseTime}ms`)
    }

    return Response.json({
      success: true,
      data: result,
      filters: { categoryId: categoryId || null, applied: !!categoryId },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        responseTime,
        merchantCount: result.nearbyMerchants?.length || 0,
      }
    }, { status: 200 })
  } catch (error) {
    const responseTime = Date.now() - startTime
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error(`❌ [${requestId}] Customer home overview error:`, message)

    let errorCode = 'INTERNAL_SERVER_ERROR'
    if (message.includes('Customer not found') || message.includes('no active address') || message.includes('Address')) {
      errorCode = 'CUSTOMER_DATA_ERROR'
    } else if (message.includes('pool') || message.includes('connect')) {
      errorCode = 'DATABASE_CONNECTION_ERROR'
    }

    if (responseTime > 10000) {
      console.error(`🔥 [${requestId}] Very slow failing query: ${responseTime}ms`)
    }

    return Response.json({
      success: false,
      error: 'Failed to fetch customer home overview',
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      responseTime,
    }, { status: 500 })
  }
}

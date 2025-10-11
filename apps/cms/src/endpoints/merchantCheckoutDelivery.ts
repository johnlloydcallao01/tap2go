import type { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { MerchantCheckoutService } from '../services/MerchantCheckoutService'

export const merchantCheckoutDeliveryHandler = async (req: PayloadRequest) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`🛒 [${requestId}] MERCHANT CHECKOUT DELIVERY REQUEST:`, {
      timestamp: new Date().toISOString(),
      query: req.query,
    })

    // PayloadCMS built-in API key authentication
    if (!req.user) {
      return Response.json({
        success: false,
        error: 'Authentication required. Please provide a valid API key.',
        code: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 401 })
    }

    // Verify user has service or admin role
    if (req.user.role !== 'service' && req.user.role !== 'admin') {
      return Response.json({
        success: false,
        error: 'Access denied. Service or admin role required.',
        code: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 403 })
    }

    // Extract and validate query parameters
    const { customerId } = req.query as {
      customerId?: string
    }

    // Validation
    if (!customerId) {
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
      return Response.json({
        success: false,
        error: 'Invalid customerId format',
        code: 'INVALID_CUSTOMER_ID',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    // Use the dedicated service
    console.log(`📋 [${requestId}] Processing checkout for customer ${customerIdNum}...`)
    const merchantCheckoutService = new MerchantCheckoutService(req.payload)
    const result = await merchantCheckoutService.getMerchantsForCheckout({
      customerId: customerIdNum
    })

    const responseTime = Date.now() - startTime
    
    console.log(`✅ [${requestId}] MERCHANT CHECKOUT DELIVERY SUCCESS:`, {
      customerId: customerIdNum,
      activeAddressId: result.customer.activeAddressId,
      coordinates: { lat: result.address.latitude, lng: result.address.longitude },
      merchantsFound: result.merchants.length,
      totalCount: result.totalCount,
      responseTime: `${responseTime}ms`,
    })

    return Response.json({
      success: true,
      data: result,
      metadata: {
        query: { customerId: customerIdNum },
        coordinates: { latitude: result.address.latitude, longitude: result.address.longitude },
        searchRadius: 100000,
        pagination: { limit: 20, offset: 0 },
        performance: { responseTime, requestId },
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 })

  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error(`🚨 [${requestId}] MERCHANT CHECKOUT DELIVERY ERROR:`, {
      error: errorMessage,
      stack: errorStack,
      query: req.query,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    })

    return Response.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
      responseTime,
    }, { status: 500 })
  }
}
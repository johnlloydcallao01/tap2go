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
    // PayloadCMS automatically authenticates API keys and populates req.user
    if (!req.user) {
      console.log(`❌ [${requestId}] Authentication failed - no user found`)
      console.log(`🔍 [${requestId}] Headers:`, Object.fromEntries(
        Object.entries(req.headers || {}).filter(([key]) => 
          key.toLowerCase().includes('auth') || key.toLowerCase().includes('api')
        )
      ))
      
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
    const { customerId } = req.query as {
      customerId?: string
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
      console.log(`❌ [${requestId}] Invalid customerId: ${customerId}`)
      
      return Response.json({
        success: false,
        error: 'Invalid customerId. Must be a valid number.',
        code: 'INVALID_PARAMETER',
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    console.log(`📋 [${requestId}] Processing request for customerId: ${customerIdNum}`)

    // Use the dedicated service
    console.log(`🔄 [${requestId}] Initializing MerchantCheckoutService...`)
    const merchantCheckoutService = new MerchantCheckoutService(req.payload)
    
    console.log(`🔍 [${requestId}] Fetching merchants for customer ${customerIdNum}...`)
    const result = await merchantCheckoutService.getMerchantsForCheckout({ customerId: customerIdNum })

    const responseTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Request completed successfully in ${responseTime}ms`)
    console.log(`📊 [${requestId}] Result summary:`, {
      customerFound: !!result.customer,
      addressFound: !!result.address,
      merchantCount: result.merchants?.length || 0
    })

    return Response.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      requestId,
      responseTime
    }, { status: 200 })

  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error(`🚨 [${requestId}] MERCHANT CHECKOUT DELIVERY ERROR:`, {
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id,
      customerId: req.query?.customerId
    })

    return Response.json({
      success: false,
      error: 'Failed to fetch merchants for checkout',
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
      responseTime
    }, { status: 500 })
  }
}
import type { PayloadRequest } from 'payload'
import { ModifierResolverService } from '../services/ModifierResolverService'
import { extractRelationshipId } from '../services/modifierUtils'

function parseId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const merchantProductDetailHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json(
        {
          success: false,
          error: 'Authentication required. Please provide a valid API key.',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 },
      )
    }

    if (req.user.role !== 'service' && req.user.role !== 'admin') {
      return Response.json(
        {
          success: false,
          error: 'Access denied. Service or admin role required.',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 },
      )
    }

    const { productId: productIdParam, merchantId: merchantIdParam, variationId: variationIdParam } = req.query as {
      productId?: string
      merchantId?: string
      variationId?: string
    }

    const productId = parseId(productIdParam)
    const merchantId = parseId(merchantIdParam)
    const variationId = parseId(variationIdParam)

    if (!productId || !merchantId) {
      return Response.json(
        {
          success: false,
          error: 'Missing required parameters: productId and merchantId',
          code: 'MISSING_REQUIRED_PARAMS',
        },
        { status: 400 },
      )
    }

    const merchantProducts = await req.payload.find({
      collection: 'merchant-products',
      where: {
        and: [
          { product_id: { equals: productId } },
          { merchant_id: { equals: merchantId } },
        ],
      },
      limit: 1,
      depth: 2,
    })

    const merchantProduct = merchantProducts.docs[0]
    if (!merchantProduct) {
      return Response.json(
        {
          success: false,
          error: 'Merchant product not found',
          code: 'MERCHANT_PRODUCT_NOT_FOUND',
        },
        { status: 404 },
      )
    }

    const rawProduct = merchantProduct.product_id
    const product =
      rawProduct && typeof rawProduct === 'object'
        ? rawProduct
        : await req.payload.findByID({
            collection: 'products',
            id: productId,
            depth: 2,
          })

    const resolver = new ModifierResolverService(req.payload)
    const effectiveModifierGroups = await resolver.resolveEffectiveGroups({
      productId,
      variationId,
      merchantId,
      merchantProductId: Number(merchantProduct.id),
    })

    let selectedVariation = null
    if (variationId) {
      const variation = await req.payload.findByID({
        collection: 'prod-variations',
        id: variationId,
        depth: 1,
      })

      const variationProductId = extractRelationshipId(variation?.product_id as never)
      if (variationProductId !== productId) {
        return Response.json(
          {
            success: false,
            error: 'Selected variation does not belong to the requested product',
            code: 'VARIATION_PRODUCT_MISMATCH',
          },
          { status: 400 },
        )
      }

      selectedVariation = variation
    }

    return Response.json({
      success: true,
      data: {
        merchantProduct,
        product,
        selectedVariation,
        effectiveModifierGroups,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      {
        success: false,
        error: 'Failed to load merchant product detail',
        message,
        code: 'MERCHANT_PRODUCT_DETAIL_ERROR',
      },
      { status: 500 },
    )
  }
}

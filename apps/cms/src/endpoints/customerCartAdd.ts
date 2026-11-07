import { APIError, type PayloadRequest } from 'payload'

type CartAddBody = {
  customer?: unknown
  merchant?: unknown
  product?: unknown
  merchantProduct?: unknown
  quantity?: unknown
  priceAtAdd?: unknown
  compareAtPrice?: unknown
  selectedModifiers?: unknown
  selectedVariation?: unknown
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

export const customerCartAddHandler = async (req: PayloadRequest) => {
  if (!req.user || (req.user.role !== 'service' && req.user.role !== 'admin')) {
    return Response.json({ success: false, error: 'Access denied' }, { status: 401 })
  }

  let body: CartAddBody
  try {
    if (typeof req.json !== 'function') {
      return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }
    body = (await req.json()) as CartAddBody
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    !isPositiveInteger(body.customer) ||
    !isPositiveInteger(body.merchant) ||
    !isPositiveInteger(body.product) ||
    !isPositiveInteger(body.merchantProduct) ||
    !isPositiveInteger(body.quantity) ||
    typeof body.priceAtAdd !== 'number' ||
    !Number.isFinite(body.priceAtAdd) ||
    body.priceAtAdd < 0 ||
    (body.compareAtPrice !== undefined &&
      body.compareAtPrice !== null &&
      (typeof body.compareAtPrice !== 'number' ||
        !Number.isFinite(body.compareAtPrice) ||
        body.compareAtPrice < 0)) ||
    (body.selectedModifiers !== undefined && !Array.isArray(body.selectedModifiers))
  ) {
    return Response.json({ success: false, error: 'Invalid cart item details' }, { status: 400 })
  }

  const data = {
    customer: body.customer,
    merchant: body.merchant,
    product: body.product,
    merchantProduct: body.merchantProduct,
    quantity: body.quantity,
    priceAtAdd: body.priceAtAdd,
    ...(body.compareAtPrice !== undefined ? { compareAtPrice: body.compareAtPrice } : {}),
    ...(body.selectedModifiers !== undefined ? { selectedModifiers: body.selectedModifiers } : {}),
    ...(body.selectedVariation !== undefined ? { selectedVariation: body.selectedVariation } : {}),
  }

  try {
    const doc = await req.payload.create({
      collection: 'cart-items',
      data: data as never,
      depth: 0,
      overrideAccess: true,
      req,
    })

    return Response.json({ success: true, doc })
  } catch (error) {
    if (error instanceof APIError) {
      const mergedMatch = /^CART_ITEM_MERGED:(\d+)$/.exec(error.message)
      if (mergedMatch) {
        const doc = await req.payload.findByID({
          collection: 'cart-items',
          id: Number(mergedMatch[1]),
          depth: 0,
          overrideAccess: true,
          req,
        })
        return Response.json({ success: true, doc, merged: true })
      }

      return Response.json(
        { success: false, error: error.message },
        { status: error.status || 400 },
      )
    }

    console.error('[customer-cart-add] request failed', error)
    return Response.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 },
    )
  }
}

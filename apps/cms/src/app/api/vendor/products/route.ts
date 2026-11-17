/**
 * @file apps/cms/src/app/api/vendor/products/route.ts
 * @description BFF aggregation endpoint for web-merchant products list.
 * GET /api/vendor/products?merchantId=5&search=pizza&productType=simple&isActive=true&page=1&limit=50
 *
 * Mirrors the outlets BFF (docs/BFF-pattern.md): authenticate vendor JWT, resolve
 * the vendor from the authenticated user, scope merchants to that vendor (with
 * outlet/vendor context + ownership guards like vendor/addresses), join
 * merchant-products -> products in memory (precedent: admin/merchant-products),
 * return sanitized rows + metrics. Frontend stays thin.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createLocalReq, getPayload, type PayloadRequest } from 'payload'
import configPromise from '@payload-config'
import { authenticateVendor } from '@/utils/mediaLibrary'
import { normalizeProductDescription, ProductDescriptionError } from '@/services/productDescription'
import {
  parseVendorProductType,
  parseVendorVariationConfiguration,
  resolveVendorGroupedItems,
  resolveVendorProductOutlets,
  validateVendorVariationAttributes,
  VendorProductCreationError,
} from '@/services/vendorProductCreation'

export const dynamic = 'force-dynamic'

function getStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return fallback
}

function getNum(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (typeof val === 'string' && val.trim() !== '') {
    const n = Number(val)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

function relId(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === 'object' && v !== null && 'id' in (v as Record<string, unknown>)) {
    const n = Number((v as Record<string, unknown>).id)
    return Number.isFinite(n) ? n : null
  }
  const n = Number(v as string | number)
  return Number.isFinite(n) ? n : null
}

function sanitizeMedia(mediaObj: unknown): Record<string, any> | null {
  if (!mediaObj || typeof mediaObj !== 'object') return null
  const obj = mediaObj as Record<string, any>
  const url = getStr(obj.cloudinaryURL || obj.url)
  if (!url) return null
  return { id: Number(obj.id), url, alt: getStr(obj.alt), filename: getStr(obj.filename) }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const authUser = await authenticateVendor(payload, request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: vendor authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const merchantParam = searchParams.get('merchantId') || searchParams.get('outletId')
    const vendorParam = searchParams.get('vendorId')
    const includeOptions = searchParams.get('includeOptions') === 'true'
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const productType = (searchParams.get('productType') || '').trim().toLowerCase()
    const isActiveParam = searchParams.get('isActive')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 50))

    // 1. Resolve vendor for user (same as outlets BFF).
    const vendorRes = await payload.find({
      collection: 'vendors',
      where: { user: { equals: authUser.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const vendor = vendorRes.docs[0] as Record<string, any> | undefined
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // 2. Scope merchants: outlet context (ownership-guarded) | explicit vendor | all vendor merchants.
    let merchantIds: number[] | null = null
    if (merchantParam) {
      const n = Number(merchantParam)
      if (!Number.isFinite(n)) return NextResponse.json({ error: 'merchantId must be numeric' }, { status: 400 })
      let merchant: Record<string, any> | null = null
      try {
        merchant = (await payload.findByID({ collection: 'merchants', id: n, depth: 0, overrideAccess: true })) as unknown as Record<string, any>
      } catch {
        return NextResponse.json({ error: 'Merchant outlet not found' }, { status: 404 })
      }
      if (!merchant) return NextResponse.json({ error: 'Merchant outlet not found' }, { status: 404 })
      if (String(relId(merchant.vendor)) !== String(vendor.id)) {
        return NextResponse.json({ error: 'Forbidden: outlet does not belong to vendor' }, { status: 403 })
      }
      merchantIds = [Number(merchant.id)]
    } else if (vendorParam) {
      const n = Number(vendorParam)
      if (!Number.isFinite(n) || String(n) !== String(vendor.id)) {
        return NextResponse.json({ error: 'Forbidden: vendor does not belong to user' }, { status: 403 })
      }
      merchantIds = null // all merchants below
    }

    if (merchantIds === null) {
      const mRes = await payload.find({
        collection: 'merchants',
        where: { vendor: { equals: vendor.id } },
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      })
      merchantIds = (mRes.docs as Record<string, any>[]).map((m) => Number(m.id)).filter((v) => Number.isFinite(v))
    }

    let productOptions: Record<string, unknown>[] | undefined
    if (includeOptions) {
      const ownedProductResult = await payload.find({
        collection: 'products',
        where: { createdByVendor: { equals: Number(vendor.id) } },
        limit: 5000,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      const ownedProducts = ownedProductResult.docs as unknown as Record<string, any>[]
      const ownedProductIds = ownedProducts.map((product) => Number(product.id)).filter(Number.isFinite)
      const assignments = ownedProductIds.length > 0 && merchantIds.length > 0
        ? await payload.find({
            collection: 'merchant-products',
            where: {
              and: [
                { product_id: { in: ownedProductIds } },
                { merchant_id: { in: merchantIds } },
                { is_active: { equals: true } },
              ],
            },
            limit: 10000,
            pagination: false,
            depth: 0,
            overrideAccess: true,
          })
        : { docs: [] }
      const assignedOutlets = new Map<number, Set<number>>()
      for (const assignment of assignments.docs as unknown as Record<string, unknown>[]) {
        const productId = relId(assignment.product_id)
        const outletId = relId(assignment.merchant_id)
        if (productId === null || outletId === null) continue
        const outletIds = assignedOutlets.get(productId) ?? new Set<number>()
        outletIds.add(outletId)
        assignedOutlets.set(productId, outletIds)
      }
      productOptions = ownedProducts.map((product) => ({
        id: Number(product.id),
        name: getStr(product.name),
        slug: getStr(product.slug),
        productType: getStr(product.productType, 'simple'),
        isActive: product.isActive !== false,
        assignedOutletIds: Array.from(assignedOutlets.get(Number(product.id)) ?? []),
      }))
    }

    if (merchantIds.length === 0) {
      return NextResponse.json({
        vendor: { id: String(vendor.id), businessName: getStr(vendor.businessName) },
        metrics: { totalListings: 0, activeListings: 0, availableListings: 0, outOfStock: 0, totalProducts: 0 },
        products: [],
        ...(includeOptions ? { productOptions: productOptions ?? [] } : {}),
        pagination: { page, limit, totalDocs: 0, totalPages: 1 },
      })
    }

    // 3. merchant-products join (precedent: admin/merchant-products bulk loads).
    const mpRes = await payload.find({
      collection: 'merchant-products',
      where: { merchant_id: { in: merchantIds } },
      limit: 2000,
      depth: 0,
      sort: '-createdAt',
      overrideAccess: true,
      context: { skipEffectiveModifierPreview: true },
    } as never)
    const mpDocs = mpRes.docs as unknown as Record<string, any>[]

    // Merchant briefs for rows.
    const merchRes = await payload.find({
      collection: 'merchants',
      where: { id: { in: merchantIds } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const merchMap = new Map<number, Record<string, any>>()
    for (const m of merchRes.docs as unknown as Record<string, any>[]) merchMap.set(Number(m.id), m)

    // 4. Products map.
    const productIds = Array.from(new Set(mpDocs.map((d) => relId(d.product_id)).filter((v): v is number => v != null)))
    const prodMap = new Map<number, Record<string, any>>()
    if (productIds.length > 0) {
      const prodRes = await payload.find({
        collection: 'products',
        where: { id: { in: productIds } },
        limit: 2000,
        depth: 1,
        overrideAccess: true,
      })
      for (const p of prodRes.docs as unknown as Record<string, any>[]) prodMap.set(Number(p.id), p)
    }

    // 5. Join + filter in memory.
    let rows = mpDocs.map((mp) => {
      const merchantId = relId(mp.merchant_id)
      const productId = relId(mp.product_id)
      const m = merchantId != null ? merchMap.get(merchantId) : undefined
      const p = productId != null ? prodMap.get(productId) : undefined
      const media = p && typeof p.media === 'object' ? (p.media as Record<string, any>) : {}
      return {
        merchantProductId: Number(mp.id),
        merchant: merchantId != null ? { id: merchantId, outletName: getStr(m?.outletName, `Outlet #${merchantId}`), outletCode: getStr(m?.outletCode) } : null,
        product: productId != null
          ? {
              id: productId,
              name: getStr(p?.name, `Product #${productId}`),
              slug: getStr(p?.slug),
              sku: getStr(p?.sku),
              productType: getStr(p?.productType, 'simple'),
              basePrice: p?.basePrice == null ? null : getNum(p.basePrice, 0),
              primaryImage: sanitizeMedia(media?.primaryImage),
            }
          : null,
        priceOverride: mp.price_override ?? null,
        stockQuantity: typeof mp.stock_quantity === 'number' ? mp.stock_quantity : 0,
        isActive: mp.is_active !== false,
        isAvailable: mp.is_available !== false,
        createdAt: getStr(mp.createdAt),
      }
    })

    if (search) {
      rows = rows.filter((r) =>
        `${r.product?.name || ''} ${r.product?.slug || ''} ${r.product?.sku || ''} ${r.merchant?.outletName || ''}`.toLowerCase().includes(search),
      )
    }
    if (productType) {
      rows = rows.filter((r) => String(r.product?.productType || '').toLowerCase() === productType)
    }
    if (isActiveParam != null && isActiveParam !== '') {
      const want = isActiveParam === 'true' || isActiveParam === '1'
      rows = rows.filter((r) => r.isActive === want)
    }

    const totalProducts = new Set(rows.map((r) => r.product?.id).filter((v) => v != null)).size
    const metrics = {
      totalListings: rows.length,
      activeListings: rows.filter((r) => r.isActive).length,
      availableListings: rows.filter((r) => r.isActive && r.isAvailable).length,
      outOfStock: rows.filter((r) => Number(r.stockQuantity) <= 0).length,
      totalProducts,
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / limit))
    const safePage = Math.min(page, totalPages)
    const paged = rows.slice((safePage - 1) * limit, safePage * limit)

    return NextResponse.json({
      vendor: { id: String(vendor.id), businessName: getStr(vendor.businessName) },
      metrics,
      products: paged,
      ...(includeOptions ? { productOptions: productOptions ?? [] } : {}),
      pagination: { page: safePage, limit, totalDocs: rows.length, totalPages },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch products'
    console.error('[vendor/products] GET error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let transactionID: string | number | null = null
  let req: Awaited<ReturnType<typeof createLocalReq>> | undefined
  let payloadInstance: Awaited<ReturnType<typeof getPayload>> | undefined

  try {
    const payload = await getPayload({ config: configPromise })
    payloadInstance = payload
    const authUser = await authenticateVendor(payload, request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: vendor authentication required' }, { status: 401 })
    }

    const vendorResult = await payload.find({
      collection: 'vendors',
      where: { user: { equals: authUser.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const vendor = vendorResult.docs[0]
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 })
    }

    let body: Record<string, unknown>
    try {
      const parsed = await request.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid product data.' }, { status: 400 })
      }
      body = parsed as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2) {
      return NextResponse.json({ error: 'Product name must be at least 2 characters.' }, { status: 400 })
    }
    if (name.length > 200) {
      return NextResponse.json({ error: 'Product name cannot exceed 200 characters.' }, { status: 400 })
    }

    const productType = parseVendorProductType(body.productType ?? 'simple')
    let basePrice: number | null = null
    let compareAtPrice: number | null = null
    let initialStockQuantity = 0
    if (productType === 'simple') {
      if (body.basePrice == null || body.basePrice === '') {
        return NextResponse.json({ error: 'A valid base price greater than or equal to zero is required for simple products.' }, { status: 400 })
      }
      if (typeof body.basePrice !== 'number' && typeof body.basePrice !== 'string') {
        return NextResponse.json({ error: 'A valid base price greater than or equal to zero is required for simple products.' }, { status: 400 })
      }
      basePrice = Number(body.basePrice)
      if (!Number.isFinite(basePrice) || basePrice < 0) {
        return NextResponse.json({ error: 'A valid base price greater than or equal to zero is required for simple products.' }, { status: 400 })
      }

      if (
        body.compareAtPrice != null &&
        body.compareAtPrice !== '' &&
        typeof body.compareAtPrice !== 'number' &&
        typeof body.compareAtPrice !== 'string'
      ) {
        return NextResponse.json({ error: 'Compare-at price must be a number.' }, { status: 400 })
      }
      compareAtPrice = body.compareAtPrice == null || body.compareAtPrice === '' ? null : Number(body.compareAtPrice)
      if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
        return NextResponse.json({ error: 'Compare-at price must be greater than or equal to zero.' }, { status: 400 })
      }
      if (body.stockQuantity !== undefined) {
        initialStockQuantity = Number(body.stockQuantity)
        if (!Number.isSafeInteger(initialStockQuantity) || initialStockQuantity < 0) {
          return NextResponse.json({ error: 'Initial stock quantity must be a whole number zero or greater.' }, { status: 400 })
        }
      }
    }

    if (body.sku != null && typeof body.sku !== 'string') {
      return NextResponse.json({ error: 'SKU must be a string.' }, { status: 400 })
    }
    const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() || null : null
    if (sku && sku.length < 2) {
      return NextResponse.json({ error: 'SKU must be at least 2 characters if provided.' }, { status: 400 })
    }
    if (sku) {
      const existingSku = await payload.find({
        collection: 'products',
        where: { sku: { equals: sku } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existingSku.docs.length > 0) {
        return NextResponse.json({ error: 'This SKU is already in use.' }, { status: 409 })
      }
    }

    const categories = body.categories === undefined ? [] : body.categories
    if (!Array.isArray(categories) || categories.some((id) =>
      !(typeof id === 'number' && Number.isInteger(id) && id > 0) &&
      !(typeof id === 'string' && /^\d+$/.test(id) && Number(id) > 0)
    )) {
      return NextResponse.json({ error: 'Categories must be a list of valid category IDs.' }, { status: 400 })
    }
    const categoryIds = Array.from(new Set(categories.map(Number)))
    if (categoryIds.length > 0) {
      const categoryResult = await payload.find({
        collection: 'product-categories',
        where: {
          and: [
            { id: { in: categoryIds } },
            { isActive: { equals: true } },
          ],
        },
        limit: categoryIds.length,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      if (categoryResult.docs.length !== categoryIds.length) {
        return NextResponse.json({ error: 'One or more selected categories are unavailable.' }, { status: 400 })
      }
    }

    const assignmentValue = body.assignment
    if (!assignmentValue || typeof assignmentValue !== 'object' || Array.isArray(assignmentValue)) {
      return NextResponse.json({ error: 'Choose one outlet or all active outlets.' }, { status: 400 })
    }
    const assignmentBody = assignmentValue as Record<string, unknown>
    let assignment: { scope: 'all' } | { scope: 'outlet'; outletId: number }
    if (assignmentBody.scope === 'all') {
      assignment = { scope: 'all' }
    } else if (assignmentBody.scope === 'outlet') {
      const rawOutletId = assignmentBody.outletId
      const outletId = Number(rawOutletId)
      if (
        !(typeof rawOutletId === 'number' && Number.isInteger(rawOutletId) && rawOutletId > 0) &&
        !(typeof rawOutletId === 'string' && /^\d+$/.test(rawOutletId) && outletId > 0)
      ) {
        return NextResponse.json({ error: 'Select a valid outlet.' }, { status: 400 })
      }
      assignment = { scope: 'outlet', outletId }
    } else {
      return NextResponse.json({ error: 'Assignment scope must be "outlet" or "all".' }, { status: 400 })
    }

    const outlets = await resolveVendorProductOutlets(payload, Number(vendor.id), assignment)
    if (productType !== 'variable' && body.variableProduct !== undefined) {
      return NextResponse.json({ error: 'Variable-product configuration is only valid for variable products.' }, { status: 400 })
    }
    if (productType !== 'grouped' && body.groupedItems !== undefined) {
      return NextResponse.json({ error: 'Grouped-item configuration is only valid for grouped products.' }, { status: 400 })
    }
    const variableConfiguration = productType === 'variable'
      ? parseVendorVariationConfiguration(body.variableProduct)
      : null
    const variationTermNames = variableConfiguration
      ? await validateVendorVariationAttributes(payload, variableConfiguration.attributeIds, variableConfiguration.variations)
      : null
    const groupedItems = productType === 'grouped'
      ? await resolveVendorGroupedItems(
          payload,
          Number(vendor.id),
          outlets.map((outlet) => Number(outlet.id)),
          body.groupedItems,
        )
      : []

    const shortDescription = typeof body.shortDescription === 'string' ? body.shortDescription.trim() : ''
    if (shortDescription.length > 500) {
      return NextResponse.json({ error: 'Short description cannot exceed 500 characters.' }, { status: 400 })
    }
    let description: Record<string, unknown> | null
    try {
      description = normalizeProductDescription(body.description)
    } catch (error) {
      if (error instanceof ProductDescriptionError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
    const catalogVisibility = body.catalogVisibility ?? 'visible'
    if (!['visible', 'catalog', 'search', 'hidden'].includes(String(catalogVisibility))) {
      return NextResponse.json({ error: 'Invalid catalog visibility.' }, { status: 400 })
    }
    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean.' }, { status: 400 })
    }

    let primaryImage: number | null = null
    if (body.primaryImage != null && body.primaryImage !== '') {
      if (
        !(typeof body.primaryImage === 'number' && Number.isInteger(body.primaryImage) && body.primaryImage > 0) &&
        !(typeof body.primaryImage === 'string' && /^\d+$/.test(body.primaryImage) && Number(body.primaryImage) > 0)
      ) {
        return NextResponse.json({ error: 'Primary image must be a valid media ID.' }, { status: 400 })
      }
      primaryImage = Number(body.primaryImage)
      const mediaResult = await payload.find({
        collection: 'media',
        where: { id: { equals: primaryImage } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (mediaResult.docs.length === 0) {
        return NextResponse.json({ error: 'Selected product image was not found.' }, { status: 400 })
      }
    }
    const variationImageIds = variableConfiguration
      ? Array.from(new Set(variableConfiguration.variations
          .map((variation) => variation.imageId)
          .filter((id): id is number => id !== null)))
      : []
    if (variationImageIds.length > 0) {
      const imageResult = await payload.find({
        collection: 'media',
        where: { id: { in: variationImageIds } },
        limit: variationImageIds.length,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      if (imageResult.docs.length !== variationImageIds.length) {
        return NextResponse.json({ error: 'One or more selected variation images were not found.' }, { status: 400 })
      }
    }

    const vendorId = Number(vendor.id)
    const baseSlug = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s-]+/g, '-') || 'product'
    transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      return NextResponse.json({ error: 'Database transaction support is required to create products safely.' }, { status: 503 })
    }
    req = await createLocalReq({
      user: authUser as NonNullable<PayloadRequest['user']>,
    }, payload)
    req.transactionID = transactionID

    const product = await payload.create({
      collection: 'products',
      data: {
        name,
        slug: baseSlug,
        sku,
        productType,
        basePrice,
        compareAtPrice,
        categories: categoryIds,
        shortDescription: shortDescription || null,
        description,
        catalogVisibility,
        isActive: body.isActive !== false,
        approvalStatus: 'approved',
        createdByVendor: vendorId,
        assign_to_all_vendor_merchants: false,
        media: { primaryImage },
      } as never,
      depth: 0,
      overrideAccess: true,
      req,
    })

    for (const outlet of outlets) {
      await payload.create({
        collection: 'merchant-products',
        data: {
          merchant_id: Number(outlet.id),
          product_id: Number(product.id),
          added_by: 'vendor',
          price_override: null,
          stock_quantity: initialStockQuantity,
          is_active: body.isActive !== false,
          is_available: true,
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    if (variableConfiguration && variationTermNames) {
      for (const [index, variation] of variableConfiguration.variations.entries()) {
        const generatedName = variation.values
          .map((item) => variationTermNames.get(item.termId))
          .filter((termName): termName is string => Boolean(termName))
          .join(' / ')
        const createdVariation = await payload.create({
          collection: 'prod-variations',
          data: {
            product_id: Number(product.id),
            modifier_behavior_mode: 'inherit_product',
            name: variation.name || generatedName || `Variation ${index + 1}`,
            short_description: variation.shortDescription,
            image: variation.imageId,
            base_price: variation.basePrice,
            compare_at_price: variation.compareAtPrice,
            stock_quantity: variation.stockQuantity,
            is_used_for_variations: true,
            is_visible: variation.isVisible,
            sort_order: index,
          } as never,
          depth: 0,
          overrideAccess: true,
          req,
        })
        for (const value of variation.values) {
          await payload.create({
            collection: 'prod-variation-values',
            data: {
              variation_id: Number(createdVariation.id),
              attribute_id: value.attributeId,
              term_id: value.termId,
            } as never,
            depth: 0,
            overrideAccess: true,
            req,
          })
        }
      }
    }

    for (const [index, item] of groupedItems.entries()) {
      await payload.create({
        collection: 'prod-grouped-items',
        data: {
          parent_product_id: Number(product.id),
          child_product_id: item.productId,
          default_quantity: item.defaultQuantity,
          sort_order: index,
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    await payload.db.commitTransaction(transactionID)
    req.transactionID = undefined
    return NextResponse.json({
      success: true,
      doc: {
        id: product.id,
        name: product.name,
        productType,
        assignedOutlets: outlets.map((outlet) => ({ id: outlet.id, outletName: outlet.outletName })),
        variationsCreated: variableConfiguration?.variations.length ?? 0,
        groupedItemsCreated: groupedItems.length,
      },
    }, { status: 201 })
  } catch (err: unknown) {
    if (transactionID) {
      try {
        await payloadInstance?.db.rollbackTransaction(transactionID)
      } catch (rollbackError) {
        console.error('[vendor/products] POST rollback error:', rollbackError)
      }
      if (req) req.transactionID = undefined
    }
    if (err instanceof VendorProductCreationError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const message = err instanceof Error ? err.message : 'Failed to create product.'
    console.error('[vendor/products] POST error:', err)
    if (/unique|duplicate/i.test(message)) {
      return NextResponse.json({ error: 'Product SKU is already in use.' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

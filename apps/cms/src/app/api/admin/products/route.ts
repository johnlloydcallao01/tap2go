/**
 * @file apps/cms/src/app/api/admin/products/route.ts
 * @description BFF aggregation for web-admin /products — master catalog.
 * GET  /api/admin/products?page=1&limit=10&search=&productType=simple&isActive=true&catalogVisibility=visible&sort=-createdAt
 * POST /api/admin/products — create product (admin-only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { bustCatalogCache, bustProductsCache, getOrBuildDashboard } from '@/utils/dashboardCache'
import { sql, type SQL } from 'drizzle-orm'
import { normalizeProductDescription, ProductDescriptionError } from '@/services/productDescription'
import {
  parseVendorProductType,
  parseVendorVariationConfiguration,
  resolveVendorGroupedItems,
  resolveVendorProductOutlets,
  validateVendorVariationAttributes,
  VendorProductCreationError,
} from '@/services/vendorProductCreation'

function sanitizeMediaRef(v: unknown): { id: number; url: string | null } | null {
  if (!v || typeof v !== 'object') return null
  const s = v as Record<string, unknown>
  const id = Number(s.id); if (Number.isNaN(id)) return null
  const url = typeof s.cloudinaryURL === 'string' ? s.cloudinaryURL : typeof s.url === 'string' ? s.url : null
  return { id, url }
}
function sanitizeDoc(raw: Record<string, any>): Record<string, any> {
  const primaryImage = sanitizeMediaRef((raw.media as any)?.primaryImage)
  const categories = Array.isArray(raw.categories) ? raw.categories.map((c: any) => typeof c === 'object' ? { id: Number(c.id), name: String(c.name || c.title || ''), slug: String(c.slug || '') } : { id: Number(c), name: String(c), slug: '' }) : []
  const vendor = raw.createdByVendor && typeof raw.createdByVendor === 'object' ? { id: Number((raw.createdByVendor as any).id), businessName: String((raw.createdByVendor as any).businessName || '') } : raw.createdByVendor ? { id: Number(raw.createdByVendor), businessName: '' } : null
  const merchant = raw.createdByMerchant && typeof raw.createdByMerchant === 'object' ? { id: Number((raw.createdByMerchant as any).id), outletName: String((raw.createdByMerchant as any).outletName || '') } : null
  return {
    id: raw.id,
    name: String(raw.name || ''),
    slug: String(raw.slug || ''),
    sku: raw.sku ? String(raw.sku) : null,
    productType: String(raw.productType || 'simple'),
    basePrice: raw.basePrice != null ? Number(raw.basePrice) : null,
    compareAtPrice: raw.compareAtPrice != null ? Number(raw.compareAtPrice) : null,
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    catalogVisibility: String(raw.catalogVisibility || 'visible'),
    categories,
    primaryImage,
    shortDescription: raw.shortDescription ? String(raw.shortDescription) : null,
    description: raw.description ?? null,
    vendor,
    merchant,
    assign_to_all_vendor_merchants: !!raw.assign_to_all_vendor_merchants,
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
  }
}
function badRequest(m: string, d?: unknown) { return NextResponse.json({ error: m, details: d }, { status: 400 }) }
function parseCsv(s: string | null): string[] { if (!s) return []; return s.split(',').map(x => x.trim().toLowerCase()).filter(Boolean) }

const PRODUCT_TYPES = new Set(['simple', 'variable', 'grouped'])
const VISIBILITY = new Set(['visible', 'catalog', 'search', 'hidden'])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    if (searchParams.get('includeOptions') === 'true') {
      const vendorId = Number(searchParams.get('vendorId'))
      if (!Number.isSafeInteger(vendorId) || vendorId < 1) return badRequest('A valid vendorId is required.')
      const productOptions = await buildProductOptions(payload, vendorId)
      return NextResponse.json({ productOptions }, { headers: { 'Cache-Control': 'private, no-store' } })
    }
    const cacheQuery = Array.from(searchParams.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'page=1&limit=10&sort=-createdAt'
    const cacheKey = `admin:products:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildProductsList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Products-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load products'
    console.error('[admin/products] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function buildProductOptions(payload: Payload, vendorId: number) {
  const vendor = await payload.findByID({
    collection: 'vendors',
    id: vendorId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)
  if (!vendor) throw new Error('Vendor not found.')

  const outletsResult = await payload.find({
    collection: 'merchants',
    where: { and: [{ vendor: { equals: vendorId } }, { isActive: { equals: true } }] },
    limit: 5000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    context: { skipStoreHours: true },
  })
  const outletIds = (outletsResult.docs as unknown as Record<string, unknown>[])
    .map((outlet) => Number(outlet.id))
    .filter((id) => Number.isSafeInteger(id) && id > 0)
  const productsResult = await payload.find({
    collection: 'products',
    where: { createdByVendor: { equals: vendorId } },
    limit: 5000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const products = productsResult.docs as unknown as Record<string, unknown>[]
  const productIds = products
    .map((product) => Number(product.id))
    .filter((id) => Number.isSafeInteger(id) && id > 0)

  const assignments = productIds.length > 0 && outletIds.length > 0
    ? await payload.find({
        collection: 'merchant-products',
        where: {
          and: [
            { product_id: { in: productIds } },
            { merchant_id: { in: outletIds } },
            { is_active: { equals: true } },
          ],
        },
        limit: 10000,
        pagination: false,
        depth: 0,
        overrideAccess: true,
        context: { skipEffectiveModifierPreview: true },
      })
    : { docs: [] }

  const assignedOutlets = new Map<number, Set<number>>()
  for (const assignment of assignments.docs as unknown as Record<string, unknown>[]) {
    const productId = relationId(assignment.product_id)
    const outletId = relationId(assignment.merchant_id)
    if (productId === null || outletId === null) continue
    const ids = assignedOutlets.get(productId) ?? new Set<number>()
    ids.add(outletId)
    assignedOutlets.set(productId, ids)
  }

  return products.map((product) => ({
    id: Number(product.id),
    name: String(product.name || ''),
    slug: String(product.slug || ''),
    productType: String(product.productType || 'simple'),
    isActive: product.isActive !== false,
    assignedOutletIds: Array.from(assignedOutlets.get(Number(product.id)) ?? []),
  }))
}

function relationId(value: unknown): number | null {
  if (typeof value === 'number' || typeof value === 'string') {
    const id = Number(value)
    return Number.isSafeInteger(id) && id > 0 ? id : null
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const id = Number((value as { id?: unknown }).id)
    return Number.isSafeInteger(id) && id > 0 ? id : null
  }
  return null
}

type Rows = { rows: Array<Record<string, unknown>> }

async function pRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

type ProductStats = {
  total: number
  simple: number
  variable: number
  grouped: number
  activeCount: number
}

/**
 * Global stats rollup — unfiltered platform totals shared by every list qs.
 * Cached 300s (own key) so per-qs list MISSes don't recount; writes bust via
 * bustProductsCache (prefix admin:products:). Filtered totals still come
 * from paginated.totalDocs (exact). See performance.md §16.
 */
async function getProductsStats(payload: Payload): Promise<ProductStats> {
  const { data } = await getOrBuildDashboard<ProductStats>(
    'admin:products:stats:v1',
    300,
    async () => {
      const rows = await pRows(payload, sql`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE product_type='simple')::int AS simple,
        COUNT(*) FILTER (WHERE product_type='variable')::int AS variable,
        COUNT(*) FILTER (WHERE product_type='grouped')::int AS grouped,
        COUNT(*) FILTER (WHERE is_active = true)::int AS active FROM products`)
      const s = rows[0] ?? {}
      return {
        total: Number(s.total ?? 0),
        simple: Number(s.simple ?? 0),
        variable: Number(s.variable ?? 0),
        grouped: Number(s.grouped ?? 0),
        activeCount: Number(s.active ?? 0),
      }
    },
  )
  return data
}

async function buildProductsList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))
    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || '-createdAt'
    const productTypeCsv = parseCsv(searchParams.get('productType'))
    const isActiveParam = searchParams.get('isActive')
    const isActiveFilter = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : null
    const visibilityCsv = parseCsv(searchParams.get('catalogVisibility'))
    const categoryParam = searchParams.get('category')
    const categoryId = categoryParam ? Number(categoryParam) : null

    const where: Record<string, any> = {}
    const and: any[] = []
    if (search) {
      and.push({
        or: [
          { name: { contains: search } },
          { slug: { contains: search } },
          { sku: { contains: search } },
          { shortDescription: { contains: search } },
        ],
      })
    }
    if (productTypeCsv.length) {
      const filtered = productTypeCsv.filter(v => PRODUCT_TYPES.has(v))
      if (filtered.length) where.productType = { in: filtered }
    }
    if (isActiveFilter !== null) where.isActive = { equals: isActiveFilter }
    if (visibilityCsv.length) {
      const filtered = visibilityCsv.filter(v => VISIBILITY.has(v))
      if (filtered.length) where.catalogVisibility = { in: filtered }
    }
    if (categoryId && !Number.isNaN(categoryId)) where.categories = { contains: categoryId }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // Paginated display + shared stats rollup in parallel.
    const [paginated, stats] = await Promise.all([
      payload.find({
        collection: 'products',
        where: Object.keys(finalWhere).length ? finalWhere : undefined,
        page,
        limit,
        sort,
        depth: 1,
        overrideAccess: true,
        select: {
          name: true,
          slug: true,
          sku: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          isActive: true,
          catalogVisibility: true,
          categories: true,
          media: true,
          shortDescription: true,
          createdByVendor: true,
          createdByMerchant: true,
          assign_to_all_vendor_merchants: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      getProductsStats(payload),
    ])

    const total = stats.total
    const activeCount = stats.activeCount

    const docs = (paginated.docs as unknown as Record<string, any>[]).map(sanitizeDoc)

    const response = {
      docs,
      pagination: {
        page: (paginated as any).page || page,
        limit: (paginated as any).limit || limit,
        totalDocs: (paginated as any).totalDocs ?? docs.length,
        totalPages: (paginated as any).totalPages ?? 1,
        hasNextPage: (paginated as any).hasNextPage ?? false,
        hasPrevPage: (paginated as any).hasPrevPage ?? false,
      },
      stats: {
        total,
        simple: stats.simple,
        variable: stats.variable,
        grouped: stats.grouped,
        activeCount,
        inactiveCount: total - activeCount,
        filteredCount: (paginated as any).totalDocs ?? docs.length,
      },
      meta: { generatedAt: new Date().toISOString(), sort, search },
    }
    return response
  } catch (err: unknown) {
    console.error('[admin/products] list build error:', err)
    throw err
  }
}

export async function POST(request: NextRequest) {
  let transactionID: string | number | null = null
  let payloadInstance: Awaited<ReturnType<typeof getPayload>> | undefined
  let req: Awaited<ReturnType<typeof createLocalReq>> | undefined

  try {
    const payload = await getPayload({ config: configPromise })
    payloadInstance = payload
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    let body: Record<string, unknown>
    try {
      const parsed: unknown = await request.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return badRequest('Invalid product data.')
      body = parsed as Record<string, unknown>
    } catch {
      return badRequest('Invalid JSON body.')
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.length < 2 || name.length > 200) return badRequest('Product name must be between 2 and 200 characters.')
    if (body.slug != null && typeof body.slug !== 'string') return badRequest('Product slug must be text.')
    const slugSource = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : name
    const slug = slugSource
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s-]+/g, '-')
    if (!slug) return badRequest('A valid product slug is required.')

    const productType = parseVendorProductType(body.productType ?? 'simple')
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : true
    const catalogVisibility = body.catalogVisibility ?? 'visible'
    if (!VISIBILITY.has(String(catalogVisibility))) return badRequest('Invalid catalog visibility.')
    const approvalStatus = body.approvalStatus ?? 'approved'
    if (!['pending', 'approved', 'disapproved'].includes(String(approvalStatus))) {
      return badRequest('Invalid product approval status.')
    }
    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return badRequest('isActive must be a boolean.')
    if (body.shortDescription != null && typeof body.shortDescription !== 'string') {
      return badRequest('Short description must be text.')
    }

    const shortDescription = typeof body.shortDescription === 'string' ? body.shortDescription.trim() : ''
    if (shortDescription.length > 500) return badRequest('Short description cannot exceed 500 characters.')

    let description: Record<string, unknown> | null
    try {
      description = normalizeProductDescription(body.description)
    } catch (error) {
      if (error instanceof ProductDescriptionError) return badRequest(error.message)
      throw error
    }

    if (body.sku != null && typeof body.sku !== 'string') return badRequest('SKU must be text.')
    const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() || null : null
    if (sku && sku.length < 2) return badRequest('SKU must be at least 2 characters if provided.')
    if (sku) {
      const existingSku = await payload.find({
        collection: 'products',
        where: { sku: { equals: sku } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existingSku.docs.length > 0) {
        return NextResponse.json({ error: 'Product SKU is already in use.' }, { status: 409 })
      }
    }

    const vendorId = parsePositiveId(body.vendorId ?? body.createdByVendor)
    if (!vendorId) return badRequest('Choose a vendor for this product.')
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 })

    const assignmentValue = body.assignment
    if (!assignmentValue || typeof assignmentValue !== 'object' || Array.isArray(assignmentValue)) {
      return badRequest('Choose one outlet or all active outlets.')
    }
    const assignmentBody = assignmentValue as Record<string, unknown>
    let assignment: { scope: 'all' } | { scope: 'outlet'; outletId: number }
    if (assignmentBody.scope === 'all') {
      assignment = { scope: 'all' }
    } else if (assignmentBody.scope === 'outlet') {
      const outletId = parsePositiveId(assignmentBody.outletId)
      if (!outletId) return badRequest('Select a valid outlet.')
      assignment = { scope: 'outlet', outletId }
    } else {
      return badRequest('Assignment scope must be "outlet" or "all".')
    }
    const outlets = await resolveVendorProductOutlets(payload, vendorId, assignment)

    const categoriesValue = body.categories ?? []
    if (!Array.isArray(categoriesValue)) return badRequest('Categories must be a list of IDs.')
    const categoryIds = categoriesValue.map(parsePositiveId)
    if (categoryIds.some((id) => id === null)) return badRequest('Categories must contain valid IDs.')
    const normalizedCategoryIds = Array.from(new Set(categoryIds as number[]))
    if (normalizedCategoryIds.length > 0) {
      const categoryResult = await payload.find({
        collection: 'product-categories',
        where: {
          and: [
            { id: { in: normalizedCategoryIds } },
            { isActive: { equals: true } },
          ],
        },
        limit: normalizedCategoryIds.length,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      if (categoryResult.docs.length !== normalizedCategoryIds.length) {
        return badRequest('One or more selected categories are unavailable.')
      }
    }

    const basePrice = productType === 'simple' ? parseNonNegativeNumber(body.basePrice) : null
    if (productType === 'simple' && basePrice === null) {
      return badRequest('A valid base price greater than or equal to zero is required for simple products.')
    }
    const compareAtPrice = productType === 'simple' ? parseOptionalNonNegativeNumber(body.compareAtPrice) : null
    if (productType === 'simple' && body.compareAtPrice != null && body.compareAtPrice !== '' && compareAtPrice === null) {
      return badRequest('Compare-at price must be greater than or equal to zero.')
    }
    const initialStockQuantity = productType === 'simple' ? parseNonNegativeInteger(body.stockQuantity ?? 0) : 0
    if (initialStockQuantity === null) return badRequest('Initial stock must be a whole number zero or greater.')
    const priceOverride = parseOptionalNonNegativeNumber(body.priceOverride)
    if (body.priceOverride != null && body.priceOverride !== '' && priceOverride === null) {
      return badRequest('Outlet price override must be greater than or equal to zero.')
    }

    const variableConfiguration = productType === 'variable'
      ? parseVendorVariationConfiguration(body.variableProduct)
      : null
    if (productType !== 'variable' && body.variableProduct !== undefined) {
      return badRequest('Variable-product configuration is only valid for variable products.')
    }
    const variationTermNames = variableConfiguration
      ? await validateVendorVariationAttributes(payload, variableConfiguration.attributeIds, variableConfiguration.variations)
      : null
    const groupedItems = productType === 'grouped'
      ? await resolveVendorGroupedItems(
          payload,
          vendorId,
          outlets.map((outlet) => Number(outlet.id)),
          body.groupedItems,
        )
      : []
    if (productType !== 'grouped' && body.groupedItems !== undefined) {
      return badRequest('Grouped-item configuration is only valid for grouped products.')
    }

    const primaryImage = body.primaryImage == null || body.primaryImage === ''
      ? null
      : parsePositiveId(body.primaryImage)
    if (body.primaryImage != null && body.primaryImage !== '' && primaryImage === null) {
      return badRequest('Primary image must be a valid media ID.')
    }
    const additionalImageValues = body.additionalImages ?? []
    if (!Array.isArray(additionalImageValues)) return badRequest('Additional images must be a list of media IDs.')
    if (additionalImageValues.length > 20) return badRequest('A product can have at most 20 additional images.')
    const additionalImageIds = additionalImageValues.map(parsePositiveId)
    if (additionalImageIds.some((id) => id === null)) return badRequest('Additional images must contain valid media IDs.')
    const imageIds = Array.from(new Set([
      ...(primaryImage === null ? [] : [primaryImage]),
      ...(additionalImageIds as number[]),
      ...(variableConfiguration?.variations.map((variation) => variation.imageId).filter((id): id is number => id !== null) ?? []),
    ]))
    if (imageIds.length > 0) {
      const images = await payload.find({
        collection: 'media',
        where: { id: { in: imageIds } },
        limit: imageIds.length,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
      if (images.docs.length !== imageIds.length) return badRequest('One or more selected product images were not found.')
    }

    transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      return NextResponse.json({ error: 'Database transaction support is required to create products safely.' }, { status: 503 })
    }
    req = await createLocalReq({ user: admin as NonNullable<PayloadRequest['user']> }, payload)
    req.transactionID = transactionID

    const product = await payload.create({
      collection: 'products',
      data: {
        name,
        slug,
        sku,
        productType,
        basePrice,
        compareAtPrice,
        categories: normalizedCategoryIds,
        shortDescription: shortDescription || null,
        description,
        catalogVisibility,
        isActive,
        approvalStatus,
        createdByVendor: vendorId,
        assign_to_all_vendor_merchants: false,
        media: {
          primaryImage,
          images: (additionalImageIds as number[]).map((image) => ({ image })),
        },
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
          price_override: priceOverride,
          stock_quantity: initialStockQuantity,
          is_active: isActive,
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
    transactionID = null
    req.transactionID = undefined
    await Promise.all([bustProductsCache(), bustCatalogCache()])
    return NextResponse.json({
      success: true,
      message: 'Product created successfully.',
      doc: {
        ...sanitizeDoc(product as unknown as Record<string, any>),
        approvalStatus,
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
        console.error('[admin/products] POST rollback error:', rollbackError)
      }
      if (req) req.transactionID = undefined
    }
    if (err instanceof VendorProductCreationError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    if (err instanceof ProductDescriptionError) return badRequest(err.message)
    const message = err instanceof Error ? err.message : 'Failed to create product.'
    if (/unique|duplicate/i.test(message)) {
      return NextResponse.json({ error: 'Product slug or SKU is already in use.' }, { status: 409 })
    }
    console.error('[admin/products] POST error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function parsePositiveId(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function parseNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string') {
    if (value.trim() === '') return null
    value = value.trim()
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function parseOptionalNonNegativeNumber(value: unknown): number | null {
  return value == null || value === '' ? null : parseNonNegativeNumber(value)
}

function parseNonNegativeInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null
}

import { NextRequest, NextResponse } from 'next/server'
import { createLocalReq, getPayload, type PayloadRequest } from 'payload'
import configPromise from '@payload-config'
import { authenticateVendor } from '@/utils/mediaLibrary'
import { findVendorOwnedProduct } from '@/services/vendorProductCreation'
import { normalizeProductDescription, productDescriptionToPlainText, ProductDescriptionError } from '@/services/productDescription'

export const dynamic = 'force-dynamic'

function relationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return id
    if (typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id))) return Number(id)
  }
  return null
}

function sanitizeMedia(value: unknown) {
  if (!value || typeof value !== 'object') return null
  const media = value as Record<string, unknown>
  const id = relationId(media)
  if (id === null) return null
  const url = typeof media.cloudinaryURL === 'string'
    ? media.cloudinaryURL
    : typeof media.url === 'string'
      ? media.url
      : null
  return { id, url }
}

function sanitizeProduct(product: Record<string, any>) {
  const media = product.media && typeof product.media === 'object' ? product.media : {}
  const categories = Array.isArray(product.categories)
    ? product.categories.map((category: unknown) => {
        if (category && typeof category === 'object') {
          const value = category as Record<string, unknown>
          return {
            id: relationId(value) ?? 0,
            name: String(value.name || ''),
            slug: String(value.slug || ''),
          }
        }
        return { id: relationId(category) ?? 0, name: '', slug: '' }
      }).filter((category: { id: number }) => category.id > 0)
    : []

  return {
    id: Number(product.id),
    name: String(product.name || ''),
    slug: String(product.slug || ''),
    sku: typeof product.sku === 'string' ? product.sku : null,
    productType: String(product.productType || 'simple'),
    basePrice: product.basePrice == null ? null : Number(product.basePrice),
    compareAtPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    shortDescription: typeof product.shortDescription === 'string' ? product.shortDescription : null,
    description: product.description ?? null,
    descriptionText: productDescriptionToPlainText(product.description),
    categories,
    primaryImage: sanitizeMedia(media.primaryImage),
    isActive: product.isActive !== false,
    catalogVisibility: String(product.catalogVisibility || 'visible'),
    assignedOutlets: [],
    createdAt: String(product.createdAt || ''),
    updatedAt: String(product.updatedAt || ''),
  }
}

async function getVendorProduct(payload: Awaited<ReturnType<typeof getPayload>>, productId: number, userId: number) {
  const vendorResult = await payload.find({
    collection: 'vendors',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const vendor = vendorResult.docs[0]
  if (!vendor) return { vendor: null, product: null }

  const product = await findVendorOwnedProduct(payload, Number(vendor.id), productId) as unknown as Record<string, any> | null
  if (!product) return { vendor, product: null }
  return { vendor, product }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!/^[1-9]\d*$/.test(id)) {
      return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const authUser = await authenticateVendor(payload, request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: vendor authentication required' }, { status: 401 })
    }

    const { vendor, product } = await getVendorProduct(payload, Number(id), Number(authUser.id))
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 })
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

    const assignmentResult = await payload.find({
      collection: 'merchant-products',
      where: { product_id: { equals: Number(id) } },
      limit: 1000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
      context: { skipEffectiveModifierPreview: true },
    })
    const outletIds = Array.from(new Set(
      (assignmentResult.docs as unknown as Record<string, unknown>[])
        .map((assignment) => relationId(assignment.merchant_id))
        .filter((value): value is number => value !== null),
    ))
    const outletsResult = outletIds.length
      ? await payload.find({
          collection: 'merchants',
          where: {
            and: [
              { id: { in: outletIds } },
              { vendor: { equals: Number(vendor.id) } },
            ],
          },
          limit: outletIds.length,
          pagination: false,
          depth: 0,
          overrideAccess: true,
          select: { id: true, outletName: true, outletCode: true, isActive: true },
        } as never)
      : { docs: [] }
    const outletMap = new Map<number, Record<string, any>>(
      (outletsResult.docs as unknown as Record<string, any>[]).map((outlet) => [Number(outlet.id), outlet]),
    )
    const assignedOutlets = (assignmentResult.docs as unknown as Record<string, any>[])
      .flatMap((assignment) => {
        const outletId = relationId(assignment.merchant_id)
        const outlet = outletId === null ? undefined : outletMap.get(outletId)
        if (!outlet) return []
        return [{
          id: outletId,
          outletName: String(outlet.outletName || `Outlet #${outletId}`),
          outletCode: String(outlet.outletCode || ''),
          isActive: outlet.isActive !== false,
          isListingActive: assignment.is_active !== false,
          isAvailable: assignment.is_available !== false,
        }]
      })

    return NextResponse.json({
      doc: { ...sanitizeProduct(product), assignedOutlets },
    })
  } catch (error: unknown) {
    console.error('[vendor/products/[id]] GET error:', error)
    return NextResponse.json({ error: 'Failed to load product.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!/^[1-9]\d*$/.test(id)) {
      return NextResponse.json({ error: 'Invalid product ID.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const authUser = await authenticateVendor(payload, request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: vendor authentication required' }, { status: 401 })
    }

    const { product } = await getVendorProduct(payload, Number(id), Number(authUser.id))
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

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

    const patch: Record<string, unknown> = {}
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 200) {
        return NextResponse.json({ error: 'Product name must be between 2 and 200 characters.' }, { status: 400 })
      }
      patch.name = body.name.trim()
    }
    if (body.slug !== undefined) {
      if (typeof body.slug !== 'string') return NextResponse.json({ error: 'Slug must be a string.' }, { status: 400 })
      const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      if (!slug) return NextResponse.json({ error: 'Slug cannot be empty.' }, { status: 400 })
      patch.slug = slug
    }
    if (body.sku !== undefined) {
      if (body.sku !== null && typeof body.sku !== 'string') {
        return NextResponse.json({ error: 'SKU must be a string.' }, { status: 400 })
      }
      const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() || null : null
      if (sku && sku.length < 2) return NextResponse.json({ error: 'SKU must be at least 2 characters.' }, { status: 400 })
      if (sku) {
        const duplicate = await payload.find({
          collection: 'products',
          where: {
            and: [
              { sku: { equals: sku } },
              { id: { not_equals: Number(id) } },
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (duplicate.docs.length) return NextResponse.json({ error: 'This SKU is already in use.' }, { status: 409 })
      }
      patch.sku = sku
    }

    if (body.basePrice !== undefined) {
      if (body.basePrice == null || body.basePrice === '') {
        if (product.productType === 'simple') {
          return NextResponse.json({ error: 'A base price is required for simple products.' }, { status: 400 })
        }
        patch.basePrice = null
      } else {
        if (typeof body.basePrice !== 'number' && typeof body.basePrice !== 'string') {
          return NextResponse.json({ error: 'Base price must be a number.' }, { status: 400 })
        }
        const basePrice = Number(body.basePrice)
        if (!Number.isFinite(basePrice) || basePrice < 0) {
          return NextResponse.json({ error: 'Base price must be greater than or equal to zero.' }, { status: 400 })
        }
        patch.basePrice = basePrice
      }
    }
    if (body.compareAtPrice !== undefined) {
      if (
        body.compareAtPrice != null &&
        body.compareAtPrice !== '' &&
        typeof body.compareAtPrice !== 'number' &&
        typeof body.compareAtPrice !== 'string'
      ) {
        return NextResponse.json({ error: 'Compare-at price must be a number.' }, { status: 400 })
      }
      if (body.compareAtPrice == null || body.compareAtPrice === '') {
        patch.compareAtPrice = null
      } else {
        const compareAtPrice = Number(body.compareAtPrice)
        if (!Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
          return NextResponse.json({ error: 'Compare-at price must be greater than or equal to zero.' }, { status: 400 })
        }
        patch.compareAtPrice = compareAtPrice
      }
    }
    if (body.shortDescription !== undefined) {
      if (body.shortDescription != null && typeof body.shortDescription !== 'string') {
        return NextResponse.json({ error: 'Short description must be a string.' }, { status: 400 })
      }
      const shortDescription = typeof body.shortDescription === 'string' ? body.shortDescription.trim() : ''
      if (shortDescription.length > 500) {
        return NextResponse.json({ error: 'Short description cannot exceed 500 characters.' }, { status: 400 })
      }
      patch.shortDescription = shortDescription || null
    }
    if (body.description !== undefined) {
      try {
        patch.description = normalizeProductDescription(body.description)
      } catch (error) {
        if (error instanceof ProductDescriptionError) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        throw error
      }
    }
    if (body.categories !== undefined) {
      if (!Array.isArray(body.categories) || body.categories.some((categoryId) =>
        !(typeof categoryId === 'number' && Number.isInteger(categoryId) && categoryId > 0) &&
        !(typeof categoryId === 'string' && /^\d+$/.test(categoryId) && Number(categoryId) > 0)
      )) {
        return NextResponse.json({ error: 'Categories must be a list of valid category IDs.' }, { status: 400 })
      }
      const categoryIds = Array.from(new Set(body.categories.map(Number)))
      if (categoryIds.length) {
        const categories = await payload.find({
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
        if (categories.docs.length !== categoryIds.length) {
          return NextResponse.json({ error: 'One or more selected categories are unavailable.' }, { status: 400 })
        }
      }
      patch.categories = categoryIds
    }
    if (body.catalogVisibility !== undefined) {
      if (!['visible', 'catalog', 'search', 'hidden'].includes(String(body.catalogVisibility))) {
        return NextResponse.json({ error: 'Invalid catalog visibility.' }, { status: 400 })
      }
      patch.catalogVisibility = body.catalogVisibility
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ error: 'isActive must be a boolean.' }, { status: 400 })
      patch.isActive = body.isActive
    }
    if (body.primaryImage !== undefined) {
      if (body.primaryImage == null || body.primaryImage === '') {
        patch.media = { primaryImage: null }
      } else {
        if (
          !(typeof body.primaryImage === 'number' && Number.isInteger(body.primaryImage) && body.primaryImage > 0) &&
          !(typeof body.primaryImage === 'string' && /^\d+$/.test(body.primaryImage) && Number(body.primaryImage) > 0)
        ) {
          return NextResponse.json({ error: 'Primary image must be a valid media ID.' }, { status: 400 })
        }
        const mediaId = Number(body.primaryImage)
        const mediaResult = await payload.find({
          collection: 'media',
          where: { id: { equals: mediaId } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        if (mediaResult.docs.length === 0) {
          return NextResponse.json({ error: 'Selected product image was not found.' }, { status: 400 })
        }
        patch.media = { primaryImage: mediaId }
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No product changes were provided.' }, { status: 400 })
    }

    const req = await createLocalReq({
      user: authUser as NonNullable<PayloadRequest['user']>,
    }, payload)
    const updated = await payload.update({
      collection: 'products',
      id: Number(id),
      data: patch as never,
      depth: 2,
      overrideAccess: true,
      req,
    }) as unknown as Record<string, any>
    return NextResponse.json({ success: true, doc: sanitizeProduct(updated) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product.'
    console.error('[vendor/products/[id]] PATCH error:', error)
    if (/unique|duplicate/i.test(message)) {
      return NextResponse.json({ error: 'Product SKU is already in use.' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

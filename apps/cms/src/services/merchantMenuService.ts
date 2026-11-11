import type { Payload } from 'payload'

type Relation = number | string | Record<string, unknown> | null | undefined
type RecordValue = Record<string, unknown>

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null
}

function relationId(value: Relation): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (isRecord(value) && (typeof value.id === 'number' || typeof value.id === 'string')) {
    return value.id
  }
  return null
}

function mediaUrl(value: unknown): string | null {
  if (!isRecord(value)) return null
  return (
    (typeof value.cloudinaryURL === 'string' && value.cloudinaryURL) ||
    (typeof value.cloudinary_url === 'string' && value.cloudinary_url) ||
    (typeof value.url === 'string' && value.url) ||
    (typeof value.thumbnailURL === 'string' && value.thumbnailURL) ||
    (typeof value.thumbnail_url === 'string' && value.thumbnail_url) ||
    null
  )
}

function categorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'item'
}

function hasRequiredModifier(
  productId: number | string,
  merchantProductId: number | string,
  groups: RecordValue[],
  overridesByKey: Map<string, RecordValue>,
): boolean {
  return groups.some((group) => {
    if (String(relationId(group.product_id as Relation)) !== String(productId)) return false

    const groupId = relationId(group.id as Relation)
    if (groupId === null) return false

    const override = overridesByKey.get(`${merchantProductId}:${groupId}`)
    if (override?.mode === 'hide') return false

    const baseRequired =
      Boolean(group.is_required) ||
      (typeof group.min_selections === 'number' && group.min_selections > 0) ||
      (typeof group.min_selections === 'string' && Number(group.min_selections) > 0)

    if (override?.mode !== 'override') return baseRequired
    if (override.required_behavior === 'required') return true
    if (override.required_behavior === 'optional') return false
    return baseRequired
  })
}

export async function buildMerchantMenuPage(
  payload: Payload,
  merchantId: number,
  page: number,
  limit: number,
) {
  const result = await payload.find({
    collection: 'merchant-products',
    where: {
      and: [
        { merchant_id: { equals: merchantId } },
        { is_active: { equals: true } },
        { is_available: { equals: true } },
        { 'product_id.catalogVisibility': { not_equals: 'hidden' } },
      ],
    },
    sort: 'id',
    page,
    limit,
    depth: 1,
    context: { skipEffectiveModifierPreview: true },
    select: { id: true, product_id: true },
  })

  const merchantProducts = result.docs as unknown as RecordValue[]
  const productsWithCatalogData = merchantProducts.flatMap((merchantProduct) => {
    const product = isRecord(merchantProduct.product_id) ? merchantProduct.product_id : null
    const productId = relationId(product?.id as Relation)
    const merchantProductId = relationId(merchantProduct.id as Relation)
    if (productId === null || merchantProductId === null || !product) return []

    const categories = Array.isArray(product.categories) ? product.categories : []
    const categoryIds: (number | string)[] = []
    const categoryDocs = new Map<number | string, RecordValue>()
    for (const category of categories) {
      const id = relationId(category as Relation)
      if (id === null) continue
      categoryIds.push(id)
      if (isRecord(category)) categoryDocs.set(id, category)
    }

    const media = isRecord(product.media) ? product.media : null
    const primaryImage = media?.primaryImage
    const primaryImageId = relationId(primaryImage as Relation)

    return [{
      productId,
      merchantProductId,
      product,
      categoryIds,
      categoryDocs,
      primaryImageId,
      imageUrl: mediaUrl(primaryImage),
    }]
  })

  const productIds = Array.from(new Set(productsWithCatalogData.map(({ productId }) => productId)))
  const merchantProductIds = productsWithCatalogData.map(({ merchantProductId }) => merchantProductId)
  const categoryIds = Array.from(
    new Set(productsWithCatalogData.flatMap(({ categoryIds: ids }) => ids)),
  )
  const imageIds = Array.from(
    new Set(
      productsWithCatalogData
        .map(({ primaryImageId }) => primaryImageId)
        .filter((id): id is number | string => id !== null),
    ),
  )

  const [modifierGroupsResult, overridesResult, categoriesResult, mediaResult] = await Promise.all([
    productIds.length
      ? payload.find({
          collection: 'modifier-groups',
          where: { product_id: { in: productIds } },
          limit: 10000,
          pagination: false,
          depth: 0,
          select: { id: true, product_id: true, is_required: true, min_selections: true },
        })
      : Promise.resolve({ docs: [] }),
    merchantProductIds.length
      ? payload.find({
          collection: 'merchant-product-modifier-group-overrides',
          where: {
            and: [
              { merchant_product_id: { in: merchantProductIds } },
              { is_active: { not_equals: false } },
            ],
          },
          limit: 10000,
          pagination: false,
          depth: 0,
          select: {
            merchant_product_id: true,
            base_modifier_group_id: true,
            mode: true,
            required_behavior: true,
          },
        })
      : Promise.resolve({ docs: [] }),
    categoryIds.length
      ? payload.find({
          collection: 'product-categories',
          where: { id: { in: categoryIds } },
          limit: Math.min(categoryIds.length, 1000),
          pagination: false,
          depth: 0,
          select: { id: true, name: true, slug: true },
        })
      : Promise.resolve({ docs: [] }),
    imageIds.length
      ? payload.find({
          collection: 'media',
          where: { id: { in: imageIds } },
          limit: Math.min(imageIds.length, 100),
          pagination: false,
          depth: 0,
          select: { id: true, cloudinaryURL: true, url: true, thumbnailURL: true },
        })
      : Promise.resolve({ docs: [] }),
  ])

  const groups = modifierGroupsResult.docs as unknown as RecordValue[]
  const overridesByKey = new Map<string, RecordValue>()
  for (const override of overridesResult.docs as unknown as RecordValue[]) {
    const merchantProductId = relationId(override.merchant_product_id as Relation)
    const groupId = relationId(override.base_modifier_group_id as Relation)
    if (merchantProductId !== null && groupId !== null) {
      overridesByKey.set(`${merchantProductId}:${groupId}`, override)
    }
  }

  const categoriesById = new Map<number | string, RecordValue>()
  for (const category of categoriesResult.docs as unknown as RecordValue[]) {
    const id = relationId(category.id as Relation)
    if (id !== null) categoriesById.set(id, category)
  }

  const mediaById = new Map<number | string, RecordValue>()
  for (const media of mediaResult.docs as unknown as RecordValue[]) {
    const id = relationId(media.id as Relation)
    if (id !== null) mediaById.set(id, media)
  }

  const categoryMap = new Map<number | string, { id: number | string; name: string; slug: string }>()
  for (const entry of productsWithCatalogData) {
    for (const id of entry.categoryIds) {
      const category = entry.categoryDocs.get(id) || categoriesById.get(id)
      if (!category || categoryMap.has(id)) continue
      const name = typeof category.name === 'string' ? category.name : ''
      categoryMap.set(id, {
        id,
        name,
        slug: typeof category.slug === 'string' ? category.slug : categorySlug(name),
      })
    }
  }

  return {
    products: productsWithCatalogData.map(({ productId, merchantProductId, product, categoryIds: ids, primaryImageId, imageUrl }) => ({
      id: productId,
      merchantProductId,
      name: typeof product.name === 'string' ? product.name : '',
      productType: typeof product.productType === 'string' ? product.productType : 'simple',
      basePrice: typeof product.basePrice === 'number' ? product.basePrice : null,
      compareAtPrice: typeof product.compareAtPrice === 'number' ? product.compareAtPrice : null,
      shortDescription: typeof product.shortDescription === 'string' ? product.shortDescription : '',
      imageUrl: imageUrl || (primaryImageId !== null ? mediaUrl(mediaById.get(primaryImageId)) : null),
      categoryIds: ids,
      hasRequiredModifiers: hasRequiredModifier(
        productId,
        merchantProductId,
        groups,
        overridesByKey,
      ),
    })),
    categories: Array.from(categoryMap.values()),
    pagination: {
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  }
}

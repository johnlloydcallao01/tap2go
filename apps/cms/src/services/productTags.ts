import type { Payload } from 'payload'

export type ProductTag = {
  id: number
  name: string
  slug: string
  tag_type: string
  color: string | null
  is_active: boolean
}

function relationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return relationId((value as { id?: unknown }).id)
  }
  return null
}

function sanitizeTag(value: unknown): ProductTag | null {
  if (!value || typeof value !== 'object') return null
  const tag = value as Record<string, unknown>
  const id = relationId(tag.id)
  if (id === null || typeof tag.name !== 'string') return null
  return {
    id,
    name: tag.name,
    slug: typeof tag.slug === 'string' ? tag.slug : '',
    tag_type: typeof tag.tag_type === 'string' ? tag.tag_type : 'general',
    color: typeof tag.color === 'string' ? tag.color : null,
    is_active: tag.is_active !== false,
  }
}

export async function getProductTags(payload: Payload, productId: number): Promise<ProductTag[]> {
  const result = await payload.find({
    collection: 'prod-tags-junction',
    where: { product_id: { equals: productId } },
    limit: 1000,
    pagination: false,
    depth: 1,
    overrideAccess: true,
  } as any)

  const tags = new Map<number, ProductTag>()
  for (const junction of result.docs as unknown as Record<string, unknown>[]) {
    const tag = sanitizeTag(junction.tag_id)
    if (tag) tags.set(tag.id, tag)
  }
  return Array.from(tags.values())
}

export async function validateProductTagIds(
  payload: Payload,
  productId: number,
  rawTagIds: unknown,
): Promise<number[]> {
  if (!Array.isArray(rawTagIds) || rawTagIds.some((id) =>
    !(typeof id === 'number' && Number.isSafeInteger(id) && id > 0)
    && !(typeof id === 'string' && /^\d+$/.test(id) && Number(id) > 0)
  )) {
    throw new Error('Tags must be a list of valid tag IDs.')
  }

  const selectedIds = Array.from(new Set(rawTagIds.map(Number)))
  const existingResult = await payload.find({
    collection: 'prod-tags-junction',
    where: { product_id: { equals: productId } },
    limit: 1000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  } as any)
  const existingIds = new Set(
    (existingResult.docs as unknown as Record<string, unknown>[])
      .map((junction) => relationId(junction.tag_id))
      .filter((id): id is number => id !== null),
  )
  const newIds = selectedIds.filter((id) => !existingIds.has(id))

  if (newIds.length) {
    const validTags = await payload.find({
      collection: 'prod-tags',
      where: {
        and: [
          { id: { in: newIds } },
          { is_active: { equals: true } },
        ],
      },
      limit: newIds.length,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    } as any)
    if (validTags.docs.length !== newIds.length) {
      throw new Error('One or more selected tags are unavailable.')
    }
  }
  return selectedIds
}

export async function syncProductTags(
  payload: Payload,
  productId: number,
  rawTagIds: unknown,
  attribution: { type: 'system' } | { type: 'vendor'; vendorId: number },
): Promise<void> {
  const selectedIds = await validateProductTagIds(payload, productId, rawTagIds)
  const existingResult = await payload.find({
    collection: 'prod-tags-junction',
    where: { product_id: { equals: productId } },
    limit: 1000,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  } as any)
  const existing = (existingResult.docs as unknown as Record<string, any>[]).map((junction) => ({
    doc: junction,
    tagId: relationId(junction.tag_id),
  })).filter((junction) => junction.tagId !== null) as Array<{ doc: Record<string, any>; tagId: number }>
  const existingIds = new Set(existing.map((junction) => junction.tagId))
  const retained = new Set<number>()
  for (const junction of existing) {
    if (!selectedIds.includes(junction.tagId) || retained.has(junction.tagId)) {
      await payload.delete({
        collection: 'prod-tags-junction',
        id: junction.doc.id,
        overrideAccess: true,
      } as any)
    } else {
      retained.add(junction.tagId)
    }
  }

  for (const tagId of selectedIds) {
    if (existingIds.has(tagId)) continue
    await payload.create({
      collection: 'prod-tags-junction',
      data: {
        product_id: productId,
        tag_id: tagId,
        added_by_type: attribution.type,
        ...(attribution.type === 'vendor' ? { added_by_vendor_id: attribution.vendorId } : {}),
        priority: 0,
        is_active: true,
      },
      overrideAccess: true,
    } as any)
  }
}

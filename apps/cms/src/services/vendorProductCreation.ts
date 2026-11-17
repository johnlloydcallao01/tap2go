import type { Payload } from 'payload'

type MerchantDoc = Record<string, unknown> & { id: number | string }

export type VendorProductType = 'simple' | 'variable' | 'grouped'

export type VendorGroupedItemInput = {
  productId: number
  defaultQuantity: number
}

export type VendorVariationInput = {
  name: string | null
  shortDescription: string | null
  imageId: number | null
  basePrice: number
  compareAtPrice: number | null
  stockQuantity: number
  isVisible: boolean
  values: { attributeId: number; termId: number }[]
}

export class VendorProductCreationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'VendorProductCreationError'
    this.status = status
  }
}

export function parseVendorProductType(value: unknown): VendorProductType {
  if (value === 'simple' || value === 'variable' || value === 'grouped') return value
  throw new VendorProductCreationError('Product type must be simple, variable, or grouped.', 400)
}

function positiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function relationNumber(value: unknown): number | null {
  if (value && typeof value === 'object' && 'id' in value) {
    return positiveInteger((value as { id?: unknown }).id)
  }
  return positiveInteger(value)
}

function nonNegativeNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const parsed = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function parseVendorVariationConfiguration(value: unknown): {
  attributeIds: number[]
  variations: VendorVariationInput[]
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new VendorProductCreationError('Configure at least one attribute and variation.', 400)
  }

  const configuration = value as Record<string, unknown>
  if (!Array.isArray(configuration.attributeIds) || configuration.attributeIds.length === 0) {
    throw new VendorProductCreationError('Select at least one attribute for a variable product.', 400)
  }
  const attributeIds = configuration.attributeIds.map(positiveInteger)
  if (attributeIds.some((id) => id === null) || new Set(attributeIds).size !== attributeIds.length) {
    throw new VendorProductCreationError('Variable product attributes must be unique valid IDs.', 400)
  }
  const normalizedAttributeIds = attributeIds as number[]
  if (!Array.isArray(configuration.variations) || configuration.variations.length === 0) {
    throw new VendorProductCreationError('Add at least one variation.', 400)
  }

  const combinations = new Set<string>()
  const variations = configuration.variations.map((raw, index): VendorVariationInput => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new VendorProductCreationError(`Variation ${index + 1} is invalid.`, 400)
    }
    const variation = raw as Record<string, unknown>
    const basePrice = nonNegativeNumber(variation.basePrice)
    if (basePrice === null) {
      throw new VendorProductCreationError(`Enter a valid price for variation ${index + 1}.`, 400)
    }

    const compareAtPrice =
      variation.compareAtPrice == null || variation.compareAtPrice === ''
        ? null
        : nonNegativeNumber(variation.compareAtPrice)
    if (variation.compareAtPrice != null && variation.compareAtPrice !== '' && compareAtPrice === null) {
      throw new VendorProductCreationError(`Compare-at price for variation ${index + 1} must be zero or greater.`, 400)
    }

    const stockQuantity = variation.stockQuantity === '' || variation.stockQuantity == null
      ? 0
      : Number(variation.stockQuantity)
    if (!Number.isSafeInteger(stockQuantity) || stockQuantity < 0) {
      throw new VendorProductCreationError(`Stock quantity for variation ${index + 1} must be a whole number zero or greater.`, 400)
    }

    if (!Array.isArray(variation.values)) {
      throw new VendorProductCreationError(`Select a value for every attribute in variation ${index + 1}.`, 400)
    }
    const values = variation.values.map((rawValue) => {
      if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) return null
      const item = rawValue as Record<string, unknown>
      const attributeId = positiveInteger(item.attributeId)
      const termId = positiveInteger(item.termId)
      return attributeId && termId ? { attributeId, termId } : null
    })
    if (
      values.some((item) => item === null) ||
      values.length !== normalizedAttributeIds.length ||
      new Set(values.map((item) => item?.attributeId)).size !== normalizedAttributeIds.length ||
      normalizedAttributeIds.some((id) => !values.some((item) => item?.attributeId === id))
    ) {
      throw new VendorProductCreationError(`Select exactly one value for every attribute in variation ${index + 1}.`, 400)
    }
    const normalizedValues = values as { attributeId: number; termId: number }[]
    const combination = normalizedAttributeIds
      .map((id) => `${id}:${normalizedValues.find((item) => item.attributeId === id)?.termId}`)
      .join('|')
    if (combinations.has(combination)) {
      throw new VendorProductCreationError('Each variation must use a unique combination of attribute values.', 400)
    }
    combinations.add(combination)

    const name = typeof variation.name === 'string' ? variation.name.trim() : ''
    const shortDescription = typeof variation.shortDescription === 'string' ? variation.shortDescription.trim() : ''
    if (shortDescription.length > 500) {
      throw new VendorProductCreationError(`Short description for variation ${index + 1} cannot exceed 500 characters.`, 400)
    }
    const imageId = variation.imageId == null || variation.imageId === '' ? null : positiveInteger(variation.imageId)
    if (variation.imageId != null && variation.imageId !== '' && imageId === null) {
      throw new VendorProductCreationError(`Image for variation ${index + 1} must be a valid media ID.`, 400)
    }
    if (variation.isVisible !== undefined && typeof variation.isVisible !== 'boolean') {
      throw new VendorProductCreationError(`Visibility for variation ${index + 1} must be a boolean.`, 400)
    }

    return {
      name: name || null,
      shortDescription: shortDescription || null,
      imageId,
      basePrice,
      compareAtPrice,
      stockQuantity,
      isVisible: variation.isVisible !== false,
      values: normalizedValues,
    }
  })

  return { attributeIds: normalizedAttributeIds, variations }
}

export async function findVendorOwnedProduct(
  payload: Payload,
  vendorId: number,
  productId: number,
) {
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [
        { id: { equals: productId } },
        { createdByVendor: { equals: vendorId } },
      ],
    },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })
  return result.docs.find((product) =>
    relationId(product.createdByVendor) === String(vendorId) &&
    Number(product.id) === productId,
  ) ?? null
}

export async function resolveVendorGroupedItems(
  payload: Payload,
  vendorId: number,
  outletIds: number[],
  value: unknown,
): Promise<VendorGroupedItemInput[]> {
  if (!Array.isArray(value) || value.length === 0) {
    throw new VendorProductCreationError('Add at least one product to a grouped product.', 400)
  }
  if (outletIds.length === 0) {
    throw new VendorProductCreationError('Grouped products require at least one assigned outlet.', 400)
  }

  const items = value.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new VendorProductCreationError(`Grouped item ${index + 1} is invalid.`, 400)
    }
    const item = raw as Record<string, unknown>
    const productId = positiveInteger(item.productId)
    const defaultQuantity = item.defaultQuantity === '' || item.defaultQuantity == null
      ? 1
      : Number(item.defaultQuantity)
    if (!productId) {
      throw new VendorProductCreationError(`Choose a valid product for grouped item ${index + 1}.`, 400)
    }
    if (!Number.isSafeInteger(defaultQuantity) || defaultQuantity < 1) {
      throw new VendorProductCreationError(`Quantity for grouped item ${index + 1} must be a whole number of at least one.`, 400)
    }
    return { productId, defaultQuantity }
  })
  const productIds = items.map((item) => item.productId)
  if (new Set(productIds).size !== productIds.length) {
    throw new VendorProductCreationError('A grouped product cannot contain the same product more than once.', 400)
  }

  const productResult = await payload.find({
    collection: 'products',
    where: {
      and: [
        { id: { in: productIds } },
        { createdByVendor: { equals: vendorId } },
      ],
    },
    limit: productIds.length,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const products = productResult.docs as unknown as Record<string, unknown>[]
  const productMap = new Map(products.map((product) => [Number(product.id), product]))
  if (productMap.size !== productIds.length) {
    throw new VendorProductCreationError('One or more selected products do not belong to your vendor account.', 403)
  }
  for (const productId of productIds) {
    const product = productMap.get(productId)
    if (product?.productType !== 'simple' && product?.productType !== 'variable') {
      throw new VendorProductCreationError('Grouped products can only contain simple or variable products.', 400)
    }
    if (product.isActive === false) {
      throw new VendorProductCreationError('Grouped products can only contain active products.', 400)
    }
  }

  const assignmentResult = await payload.find({
    collection: 'merchant-products',
    where: {
      and: [
        { product_id: { in: productIds } },
        { merchant_id: { in: outletIds } },
        { is_active: { equals: true } },
      ],
    },
    limit: productIds.length * outletIds.length,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const outletAssignments = new Map<number, Set<number>>()
  for (const assignment of assignmentResult.docs as unknown as Record<string, unknown>[]) {
    const productId = relationNumber(assignment.product_id)
    const outletId = relationNumber(assignment.merchant_id)
    if (productId === null || outletId === null) continue
    const assigned = outletAssignments.get(productId) ?? new Set<number>()
    assigned.add(outletId)
    outletAssignments.set(productId, assigned)
  }
  for (const productId of productIds) {
    const assigned = outletAssignments.get(productId)
    if (outletIds.some((outletId) => !assigned?.has(outletId))) {
      throw new VendorProductCreationError(
        'Each grouped product must already be actively assigned to every outlet selected for the grouped product.',
        400,
      )
    }
  }

  return items
}

export async function validateVendorVariationAttributes(
  payload: Payload,
  attributeIds: number[],
  variations: VendorVariationInput[],
): Promise<Map<number, string>> {
  const attributesResult = await payload.find({
    collection: 'prod-attributes',
    where: {
      and: [
        { id: { in: attributeIds } },
        { is_active: { equals: true } },
      ],
    },
    limit: attributeIds.length,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  if (attributesResult.docs.length !== attributeIds.length) {
    throw new VendorProductCreationError('One or more selected attributes are unavailable.', 400)
  }

  const termIds = Array.from(new Set(variations.flatMap((variation) => variation.values.map((item) => item.termId))))
  const termsResult = await payload.find({
    collection: 'prod-attribute-terms',
    where: {
      and: [
        { id: { in: termIds } },
        { is_active: { equals: true } },
      ],
    },
    limit: termIds.length,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const terms = termsResult.docs as unknown as Record<string, unknown>[]
  if (terms.length !== termIds.length) {
    throw new VendorProductCreationError('One or more selected attribute values are unavailable.', 400)
  }
  const attributeIdByTermId = new Map<number, number>()
  const termNames = new Map<number, string>()
  for (const term of terms) {
    const termId = Number(term.id)
    const attributeId = relationNumber(term.attribute_id)
    if (Number.isFinite(termId) && attributeId !== null) {
      attributeIdByTermId.set(termId, attributeId)
      termNames.set(termId, String(term.name || ''))
    }
  }
  for (const variation of variations) {
    for (const item of variation.values) {
      if (attributeIdByTermId.get(item.termId) !== item.attributeId) {
        throw new VendorProductCreationError('An attribute value does not belong to its selected attribute.', 400)
      }
    }
  }
  return termNames
}

function relationId(value: unknown): string | null {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return String(id)
  }
  return null
}

export async function resolveVendorProductOutlets(
  payload: Payload,
  vendorId: number,
  assignment: { scope: 'all' } | { scope: 'outlet'; outletId: number },
): Promise<MerchantDoc[]> {
  if (assignment.scope === 'all') {
    const result = await payload.find({
      collection: 'merchants',
      where: {
        and: [
          { vendor: { equals: vendorId } },
          { isActive: { equals: true } },
        ],
      },
      limit: 1000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    const outlets = (result.docs as unknown as MerchantDoc[]).filter(
      (outlet) => relationId(outlet.vendor) === String(vendorId) && outlet.isActive === true,
    )
    if (outlets.length === 0) {
      throw new VendorProductCreationError('You need at least one active outlet to assign this product.', 400)
    }
    return outlets
  }

  let outlet: MerchantDoc
  try {
    outlet = await payload.findByID({
      collection: 'merchants',
      id: assignment.outletId,
      depth: 0,
      overrideAccess: true,
    }) as unknown as MerchantDoc
  } catch {
    throw new VendorProductCreationError('Outlet not found.', 404)
  }

  if (relationId(outlet.vendor) !== String(vendorId)) {
    throw new VendorProductCreationError('You can only assign products to your own outlets.', 403)
  }
  if (outlet.isActive !== true) {
    throw new VendorProductCreationError('Products can only be assigned to active outlets.', 400)
  }
  return [outlet]
}

import { extractRelationshipId, toFiniteNumber, toOptionalTrimmedText } from './modifierUtils'

export type OrderItemSnapshotEntry = {
  entryType: 'variation' | 'modifier' | 'grouped'
  sourceType?:
    | 'product-base'
    | 'variation-added'
    | 'variation-overridden'
    | 'merchant-product-overridden'
    | 'merchant-variation-overridden'
  groupId?: number
  groupName?: string
  optionId?: number
  optionName?: string
  selectedVariationId?: number
  selectedVariationName?: string
  variationSku?: string
  variationDescription?: string
  variationAttributes?: Array<{
    attributeName: string
    termName: string
  }>
  groupedProductId?: number
  groupedProductName?: string
  name: string
  price: number
}

function normalizeSnapshotEntry(value: unknown): OrderItemSnapshotEntry | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Record<string, unknown>
  const entryType =
    raw.entryType === 'variation' || raw.entryType === 'grouped'
      ? raw.entryType
      : 'modifier'
  const name =
    toOptionalTrimmedText(raw.name) ??
    toOptionalTrimmedText(raw.optionName) ??
    toOptionalTrimmedText(raw.selectedVariationName)

  if (!name) {
    return null
  }

  const sourceType =
    raw.sourceType === 'variation-added' ||
    raw.sourceType === 'variation-overridden' ||
    raw.sourceType === 'merchant-product-overridden' ||
    raw.sourceType === 'merchant-variation-overridden' ||
    raw.sourceType === 'product-base'
      ? raw.sourceType
      : undefined

  const groupId = extractRelationshipId(raw.groupId as never) ?? undefined
  const optionId = extractRelationshipId(raw.optionId as never) ?? undefined
  const selectedVariationId = extractRelationshipId(raw.selectedVariationId as never) ?? undefined
  const variationAttributes = Array.isArray(raw.variationAttributes)
    ? raw.variationAttributes.flatMap((attribute) => {
        if (!attribute || typeof attribute !== 'object') return []
        const attributeRecord = attribute as Record<string, unknown>
        const attributeName = toOptionalTrimmedText(attributeRecord.attributeName)
        const termName = toOptionalTrimmedText(attributeRecord.termName)
        return attributeName && termName ? [{ attributeName, termName }] : []
      })
    : undefined
  const groupedProductId = extractRelationshipId(raw.groupedProductId as never) ?? undefined

  return {
    entryType,
    sourceType,
    groupId,
    groupName: toOptionalTrimmedText(raw.groupName),
    optionId,
    optionName: toOptionalTrimmedText(raw.optionName) ?? name,
    selectedVariationId,
    selectedVariationName: toOptionalTrimmedText(raw.selectedVariationName),
    variationSku: toOptionalTrimmedText(raw.variationSku),
    variationDescription: toOptionalTrimmedText(raw.variationDescription),
    ...(variationAttributes?.length ? { variationAttributes } : {}),
    groupedProductId,
    groupedProductName: toOptionalTrimmedText(raw.groupedProductName),
    name,
    price: toFiniteNumber(raw.price),
  }
}

export function normalizeOrderItemOptionsSnapshot(value: unknown): OrderItemSnapshotEntry[] {
  if (value === null || value === undefined) {
    return []
  }

  if (!Array.isArray(value)) {
    throw new Error('options_snapshot must be an array when provided')
  }

  return value
    .map((entry) => normalizeSnapshotEntry(entry))
    .filter((entry): entry is OrderItemSnapshotEntry => entry !== null)
}

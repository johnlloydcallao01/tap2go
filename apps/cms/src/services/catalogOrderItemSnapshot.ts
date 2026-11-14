import type { Payload } from 'payload'
import { extractRelationshipId } from './modifierUtils'

export type VariationAttributeSnapshot = {
  attributeName: string
  termName: string
}

export type CatalogOrderItemSnapshotEntry = {
  entryType: 'variation' | 'grouped'
  name: string
  price: number
  selectedVariationId?: number
  selectedVariationName?: string
  variationSku?: string
  variationDescription?: string
  variationAttributes?: VariationAttributeSnapshot[]
  groupedProductId?: number
  groupedProductName?: string
}

function relatedRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

export async function resolveCatalogOrderItemSnapshot(args: {
  payload: Payload
  productId: number
  merchantId: number
  variationId: number | null
  groupedProductId: number | null
  variation?: Record<string, unknown> | null
  groupedProductName?: string | null
}): Promise<CatalogOrderItemSnapshotEntry[]> {
  const entries: CatalogOrderItemSnapshotEntry[] = []

  if (args.variationId) {
    const variation = args.variation ?? await args.payload.findByID({
      collection: 'prod-variations',
      id: args.variationId,
      depth: 0,
      overrideAccess: true,
    })
    if (extractRelationshipId(variation.product_id as never) !== args.productId) {
      throw new Error('Selected variation does not belong to the ordered product')
    }

    const values = await args.payload.find({
      collection: 'prod-variation-values',
      where: { variation_id: { equals: args.variationId } },
      depth: 2,
      limit: 100,
      pagination: false,
      overrideAccess: true,
    })
    const variationAttributes = values.docs.map((value) => {
      const attribute = relatedRecord(value.attribute_id)
      const term = relatedRecord(value.term_id)
      const attributeName = typeof attribute?.name === 'string' ? attribute.name.trim() : ''
      const termName = typeof term?.name === 'string' ? term.name.trim() : ''
      if (!attributeName || !termName) {
        throw new Error(`Variation ${args.variationId} has an attribute value that could not be loaded`)
      }
      return { attributeName, termName }
    })

    const name = typeof variation.name === 'string' && variation.name.trim()
      ? variation.name.trim()
      : `Variation #${args.variationId}`
    entries.push({
      entryType: 'variation',
      name,
      selectedVariationId: args.variationId,
      selectedVariationName: name,
      ...(typeof variation.sku === 'string' && variation.sku.trim()
        ? { variationSku: variation.sku.trim() }
        : {}),
      ...(typeof variation.short_description === 'string' && variation.short_description.trim()
        ? { variationDescription: variation.short_description.trim() }
        : {}),
      ...(variationAttributes.length > 0 ? { variationAttributes } : {}),
      price: 0,
    })
  }

  if (args.groupedProductId || args.groupedProductName?.trim()) {
    let groupedProductName = args.groupedProductName?.trim() || ''
    if (args.groupedProductId) {
      const groupedProduct = await args.payload.findByID({
        collection: 'products',
        id: args.groupedProductId,
        depth: 0,
        overrideAccess: true,
      })
      if (groupedProduct.productType !== 'grouped') {
        throw new Error('The cart item references a product that is not a grouped product')
      }

      const [groupMembership, merchantListing] = await Promise.all([
        args.payload.find({
          collection: 'prod-grouped-items',
          where: {
            and: [
              { parent_product_id: { equals: args.groupedProductId } },
              { child_product_id: { equals: args.productId } },
            ],
          },
          limit: 1,
          pagination: false,
          overrideAccess: true,
        }),
        args.payload.find({
          collection: 'merchant-products',
          where: {
            and: [
              { product_id: { equals: args.groupedProductId } },
              { merchant_id: { equals: args.merchantId } },
            ],
          },
          limit: 1,
          pagination: false,
          overrideAccess: true,
        }),
      ])
      if (groupMembership.docs.length === 0 || merchantListing.docs.length === 0) {
        throw new Error("The selected item is no longer part of this merchant's grouped product")
      }

      groupedProductName ||= typeof groupedProduct.name === 'string' && groupedProduct.name.trim()
        ? groupedProduct.name.trim()
        : `Grouped product #${args.groupedProductId}`
    }
    entries.push({
      entryType: 'grouped',
      name: groupedProductName,
      ...(args.groupedProductId ? { groupedProductId: args.groupedProductId } : {}),
      groupedProductName,
      price: 0,
    })
  }

  return entries
}

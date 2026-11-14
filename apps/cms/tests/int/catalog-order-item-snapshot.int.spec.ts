import { describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { resolveCatalogOrderItemSnapshot } from '../../src/services/catalogOrderItemSnapshot'
import { normalizeOrderItemOptionsSnapshot } from '../../src/services/orderItemSnapshot'

describe('catalog order item snapshot', () => {
  it('snapshots variation attributes and grouped-product parent details', async () => {
    const payload = {
      findByID: async ({ collection }: { collection: string }) => {
        if (collection === 'prod-variations') {
          return {
            id: 501,
            product_id: 100,
            name: 'Large pack',
            sku: 'STEAK-L',
            short_description: 'Four slices, 490g',
          }
        }
        return { id: 700, productType: 'grouped', name: 'Steak Dinner Bundle' }
      },
      find: async ({ collection }: { collection: string }) => {
        if (collection === 'prod-variation-values') {
          return {
            docs: [{
              attribute_id: { id: 11, name: 'Pack Size' },
              term_id: { id: 21, name: '4 slices, 490g' },
            }],
          }
        }
        return { docs: [{}] }
      },
    } as unknown as Payload

    const snapshot = await resolveCatalogOrderItemSnapshot({
      payload,
      productId: 100,
      merchantId: 31,
      variationId: 501,
      groupedProductId: 700,
    })

    const persistedSnapshot = normalizeOrderItemOptionsSnapshot(snapshot)
    expect(persistedSnapshot[0]).toMatchObject({
      selectedVariationId: 501,
      variationAttributes: [{ attributeName: 'Pack Size', termName: '4 slices, 490g' }],
    })
    expect(persistedSnapshot[1]).toMatchObject({
      entryType: 'grouped',
      groupedProductId: 700,
      groupedProductName: 'Steak Dinner Bundle',
    })
    expect(snapshot).toEqual([
      {
        entryType: 'variation',
        name: 'Large pack',
        selectedVariationId: 501,
        selectedVariationName: 'Large pack',
        variationSku: 'STEAK-L',
        variationDescription: 'Four slices, 490g',
        variationAttributes: [{ attributeName: 'Pack Size', termName: '4 slices, 490g' }],
        price: 0,
      },
      {
        entryType: 'grouped',
        name: 'Steak Dinner Bundle',
        groupedProductId: 700,
        groupedProductName: 'Steak Dinner Bundle',
        price: 0,
      },
    ])
  })
})

import { describe, expect, it } from 'vitest'
import { validateModifierContext } from '../../src/services/modifierContext'
import { validateOrderItemSnapshot } from '../../src/services/orderItemValidation'

function createPayload(collections: Record<string, any[]>) {
  return {
    find: async ({ collection }: { collection: string }) => ({
      docs: collections[collection] ?? [],
    }),
    findByID: async ({ collection, id }: { collection: string; id: number | string }) => {
      const doc = (collections[collection] ?? []).find((entry) => String(entry.id) === String(id))
      if (!doc) throw new Error(`Missing ${collection}:${id}`)
      return doc
    },
  }
}

describe('modifier trust boundaries', () => {
  it('skips modifier catalog reads when an order snapshot has no selected modifiers', async () => {
    const payload = {
      find: async () => {
        throw new Error('Modifier catalog should not be read for an empty selection')
      },
      findByID: async () => {
        throw new Error('Variation lookup should not run when no variation is selected')
      },
    }

    await expect(
      validateOrderItemSnapshot({
        payload: payload as any,
        productId: 10,
        merchantProductId: 30,
        optionsSnapshot: [],
        requireStructuredEntries: true,
      }),
    ).resolves.toBeUndefined()
  })

  it('still validates a selected variation without loading modifier catalogs', async () => {
    const payload = {
      find: async () => {
        throw new Error('Modifier catalog should not be read for a variation-only selection')
      },
      findByID: async ({ collection, id }: { collection: string; id: number }) => {
        if (collection === 'prod-variations' && id === 20) {
          return { id: 20, product_id: 10 }
        }
        throw new Error(`Unexpected lookup ${collection}:${id}`)
      },
    }

    await expect(
      validateOrderItemSnapshot({
        payload: payload as any,
        productId: 10,
        merchantProductId: 30,
        optionsSnapshot: [
          {
            entryType: 'variation',
            selectedVariationId: 20,
            selectedVariationName: 'Large',
            name: 'Large',
            price: 0,
          },
        ],
        requireStructuredEntries: true,
      }),
    ).resolves.toBeUndefined()
  })

  it('rejects a variation belonging to another product', async () => {
    const payload = createPayload({
      products: [{ id: 10 }],
      'prod-variations': [{ id: 20, product_id: 11 }],
    })

    await expect(
      validateModifierContext(payload as any, {
        productId: 10,
        variationId: 20,
      }),
    ).rejects.toMatchObject({ code: 'VARIATION_PRODUCT_MISMATCH' })
  })

  it('rejects a merchant product belonging to another catalog product', async () => {
    const payload = createPayload({
      products: [{ id: 10 }],
      'merchant-products': [{ id: 30, product_id: 11, merchant_id: 40 }],
    })

    await expect(
      validateModifierContext(payload as any, {
        productId: 10,
        merchantProductId: 30,
      }),
    ).rejects.toMatchObject({ code: 'MERCHANT_PRODUCT_PRODUCT_MISMATCH' })
  })

  it('rejects a tampered structured option price in an order snapshot', async () => {
    const payload = createPayload({
      'prod-variations': [],
      'modifier-groups': [
        {
          id: 1,
          product_id: 10,
          name: 'Sauce',
          selection_type: 'single',
          is_required: false,
          min_selections: 0,
          max_selections: 1,
          sort_order: 0,
        },
      ],
      'modifier-options': [
        {
          id: 2,
          modifier_group_id: 1,
          name: 'Mayo',
          price_adjustment: 5,
          is_available: true,
          sort_order: 0,
        },
      ],
      'variation-modifier-groups': [],
      'variation-modifier-options': [],
      'variation-modifier-group-overrides': [],
      'variation-modifier-option-overrides': [],
      'merchant-products': [],
      'merchant-product-modifier-group-overrides': [],
      'merchant-product-modifier-option-overrides': [],
      'merchant-variation-modifier-group-overrides': [],
      'merchant-variation-modifier-option-overrides': [],
    })

    await expect(
      validateOrderItemSnapshot({
        payload: payload as any,
        productId: 10,
        merchantProductId: null,
        optionsSnapshot: [
          {
            entryType: 'modifier',
            groupId: 1,
            optionId: 2,
            name: 'Mayo',
            optionName: 'Mayo',
            price: 999,
          },
        ],
        requireStructuredEntries: true,
      }),
    ).rejects.toThrow('price does not match')
  })
})

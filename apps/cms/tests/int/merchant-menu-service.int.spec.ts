import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { buildMerchantMenuPage } from '../../src/services/merchantMenuService'

describe('buildMerchantMenuPage', () => {
  it('batches menu enrichment and applies merchant modifier overrides', async () => {
    const calls: Array<Record<string, unknown>> = []
    const find = vi.fn(async (args: Record<string, unknown>) => {
      calls.push(args)
      switch (args.collection) {
        case 'merchant-products':
          return {
            docs: [
              {
                id: 101,
                product_id: {
                  id: 1,
                  name: 'Hidden requirement',
                  productType: 'simple',
                  basePrice: 100,
                  compareAtPrice: null,
                  shortDescription: '',
                  categories: [5],
                  media: { primaryImage: 8 },
                },
              },
              {
                id: 102,
                product_id: {
                  id: 2,
                  name: 'Merchant-required option',
                  productType: 'simple',
                  basePrice: 200,
                  compareAtPrice: null,
                  shortDescription: '',
                  categories: [],
                  media: { primaryImage: null },
                },
              },
            ],
            totalDocs: 2,
            limit: 20,
            page: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        case 'modifier-groups':
          return {
            docs: [
              { id: 11, product_id: 1, is_required: true, min_selections: 1 },
              { id: 22, product_id: 2, is_required: false, min_selections: 0 },
            ],
          }
        case 'merchant-product-modifier-group-overrides':
          return {
            docs: [
              { merchant_product_id: 101, base_modifier_group_id: 11, mode: 'hide' },
              {
                merchant_product_id: 102,
                base_modifier_group_id: 22,
                mode: 'override',
                required_behavior: 'required',
              },
            ],
          }
        case 'product-categories':
          return { docs: [{ id: 5, name: 'Meals', slug: 'meals' }] }
        case 'media':
          return { docs: [{ id: 8, cloudinaryURL: 'https://cdn.example.test/product.jpg' }] }
        default:
          throw new Error(`Unexpected collection: ${String(args.collection)}`)
      }
    })
    const payload = { find } as unknown as Payload

    const menu = await buildMerchantMenuPage(payload, 17, 1, 20)

    expect(menu.products.map((product) => product.hasRequiredModifiers)).toEqual([false, true])
    expect(menu.products[0].imageUrl).toBe('https://cdn.example.test/product.jpg')
    expect(menu.categories).toEqual([{ id: 5, name: 'Meals', slug: 'meals' }])
    expect(menu.pagination).toEqual({
      totalDocs: 2,
      limit: 20,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    })
    expect(calls.map((call) => call.collection)).toEqual([
      'merchant-products',
      'modifier-groups',
      'merchant-product-modifier-group-overrides',
      'product-categories',
      'media',
    ])
    expect(calls[0]).toMatchObject({
      depth: 1,
      context: { skipEffectiveModifierPreview: true },
      select: { id: true, product_id: true },
    })
    expect(calls.slice(1).every((call) => call.pagination === false)).toBe(true)
  })
})

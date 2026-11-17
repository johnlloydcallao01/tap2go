import { describe, expect, it } from 'vitest'
import {
  findVendorOwnedProduct,
  parseVendorProductType,
  parseVendorVariationConfiguration,
  resolveVendorGroupedItems,
  resolveVendorProductOutlets,
  validateVendorVariationAttributes,
  VendorProductCreationError,
} from '../../src/services/vendorProductCreation'
import {
  normalizeProductDescription,
  productDescriptionToPlainText,
} from '../../src/services/productDescription'

function createPayload(outlets: Record<string, unknown>[]) {
  return {
    find: async () => ({ docs: outlets }),
    findByID: async ({ id }: { id: number }) => {
      const outlet = outlets.find((item) => Number(item.id) === id)
      if (!outlet) throw new Error('Not found')
      return outlet
    },
  }
}

describe('vendor product outlet assignment', () => {
  it('assigns a product to every active outlet owned by the vendor', async () => {
    const payload = createPayload([
      { id: 1, vendor: 7, isActive: true },
      { id: 2, vendor: 7, isActive: true },
      { id: 3, vendor: 8, isActive: true },
      { id: 4, vendor: 7, isActive: false },
    ])

    await expect(resolveVendorProductOutlets(payload as never, 7, { scope: 'all' }))
      .resolves.toHaveLength(2)
  })

  describe('vendor-owned product lookup', () => {
    function payloadFor(products: Record<string, unknown>[]) {
      return {
        find: async () => ({ docs: products }),
      }
    }

    it('returns a product owned by the authenticated vendor', async () => {
      const payload = payloadFor([{ id: 12, createdByVendor: 7, name: 'Tea' }])

      await expect(findVendorOwnedProduct(payload as never, 7, 12))
        .resolves.toMatchObject({ id: 12, name: 'Tea' })
    })

    it('does not return another vendor product', async () => {
      const payload = payloadFor([{ id: 12, createdByVendor: 8, name: 'Tea' }])

      await expect(findVendorOwnedProduct(payload as never, 7, 12)).resolves.toBeNull()
    })
  })

  describe('vendor product type configuration', () => {
    it.each(['simple', 'variable', 'grouped'] as const)('accepts the %s product type', (productType) => {
      expect(parseVendorProductType(productType)).toBe(productType)
    })

    it('rejects unsupported product types', () => {
      expect(() => parseVendorProductType('external')).toThrow(VendorProductCreationError)
    })

    it('normalizes variable attributes and per-variation values', () => {
      const configuration = parseVendorVariationConfiguration({
        attributeIds: [2, 1],
        variations: [{
          name: '',
          basePrice: '12.5',
          stockQuantity: '4',
          values: [
            { attributeId: 2, termId: 8 },
            { attributeId: 1, termId: 5 },
          ],
        }],
      })

      expect(configuration).toMatchObject({
        attributeIds: [2, 1],
        variations: [{
          name: null,
          basePrice: 12.5,
          stockQuantity: 4,
          isVisible: true,
          values: [{ attributeId: 2, termId: 8 }, { attributeId: 1, termId: 5 }],
        }],
      })
    })

    it('rejects duplicate or incomplete variation combinations', () => {
      expect(() => parseVendorVariationConfiguration({
        attributeIds: [1],
        variations: [
          { basePrice: 10, values: [{ attributeId: 1, termId: 3 }] },
          { basePrice: 12, values: [{ attributeId: 1, termId: 3 }] },
        ],
      })).toThrow(/unique combination/)

      expect(() => parseVendorVariationConfiguration({
        attributeIds: [1, 2],
        variations: [{ basePrice: 10, values: [{ attributeId: 1, termId: 3 }] }],
      })).toThrow(/exactly one value/)
    })

    it('validates that active variation terms belong to their selected attributes', async () => {
      const payload = {
        find: async ({ collection }: { collection: string }) => ({
          docs: collection === 'prod-attributes'
            ? [{ id: 1, is_active: true }]
            : [{ id: 3, attribute_id: 1, name: 'Small', is_active: true }],
        }),
      }
      const config = parseVendorVariationConfiguration({
        attributeIds: [1],
        variations: [{ basePrice: 10, values: [{ attributeId: 1, termId: 3 }] }],
      })

      await expect(validateVendorVariationAttributes(payload as never, config.attributeIds, config.variations))
        .resolves.toEqual(new Map([[3, 'Small']]))

      const invalidPayload = {
        find: async ({ collection }: { collection: string }) => ({
          docs: collection === 'prod-attributes'
            ? [{ id: 1, is_active: true }]
            : [{ id: 3, attribute_id: 2, name: 'Small', is_active: true }],
        }),
      }
      await expect(validateVendorVariationAttributes(invalidPayload as never, config.attributeIds, config.variations))
        .rejects.toThrow(/does not belong/)
    })
  })

  describe('vendor grouped product composition', () => {
    it('accepts vendor-owned active simple or variable products listed at all target outlets', async () => {
      const payload = {
        find: async ({ collection }: { collection: string }) => ({
          docs: collection === 'products'
            ? [
                { id: 10, createdByVendor: 7, productType: 'simple', isActive: true },
                { id: 11, createdByVendor: 7, productType: 'variable', isActive: true },
              ]
            : [
                { product_id: 10, merchant_id: 1, is_active: true },
                { product_id: 10, merchant_id: 2, is_active: true },
                { product_id: 11, merchant_id: 1, is_active: true },
                { product_id: 11, merchant_id: 2, is_active: true },
              ],
        }),
      }

      await expect(resolveVendorGroupedItems(payload as never, 7, [1, 2], [
        { productId: 10, defaultQuantity: 1 },
        { productId: 11, defaultQuantity: 2 },
      ])).resolves.toEqual([
        { productId: 10, defaultQuantity: 1 },
        { productId: 11, defaultQuantity: 2 },
      ])
    })

    it('rejects products owned by another vendor and children missing an outlet listing', async () => {
      const foreignProductPayload = {
        find: async () => ({ docs: [] }),
      }
      await expect(resolveVendorGroupedItems(foreignProductPayload as never, 7, [1], [
        { productId: 10, defaultQuantity: 1 },
      ])).rejects.toMatchObject({ status: 403 })

      const missingOutletPayload = {
        find: async ({ collection }: { collection: string }) => ({
          docs: collection === 'products'
            ? [{ id: 10, createdByVendor: 7, productType: 'simple', isActive: true }]
            : [{ product_id: 10, merchant_id: 1, is_active: true }],
        }),
      }
      await expect(resolveVendorGroupedItems(missingOutletPayload as never, 7, [1, 2], [
        { productId: 10, defaultQuantity: 1 },
      ])).rejects.toThrow(/every outlet/)
    })
  })

  describe('plain product descriptions', () => {
    it('stores plain text as simple rich-text paragraphs and reads it back unchanged', () => {
      const description = normalizeProductDescription('Fresh coffee\nRoasted locally')

      expect(description?.root).toMatchObject({
        children: [
          { type: 'paragraph', children: [{ type: 'text', text: 'Fresh coffee' }] },
          { type: 'paragraph', children: [{ type: 'text', text: 'Roasted locally' }] },
        ],
      })
      expect(productDescriptionToPlainText(description)).toBe('Fresh coffee\nRoasted locally')
    })

    it('preserves existing rich-text documents passed by older clients', () => {
      const existing = {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Existing copy' }],
          }],
        },
      }

      expect(normalizeProductDescription(JSON.stringify(existing))).toEqual(existing)
      expect(productDescriptionToPlainText(existing)).toBe('Existing copy')
    })
  })

  it('assigns a product to one selected outlet', async () => {
    const payload = createPayload([{ id: 3, vendor: { id: 7 }, isActive: true }])

    await expect(resolveVendorProductOutlets(payload as never, 7, { scope: 'outlet', outletId: 3 }))
      .resolves.toMatchObject([{ id: 3 }])
  })

  it('rejects all-outlet assignment when there are no active vendor outlets', async () => {
    const payload = createPayload([{ id: 4, vendor: 7, isActive: false }])

    await expect(resolveVendorProductOutlets(payload as never, 7, { scope: 'all' }))
      .rejects.toMatchObject({ status: 400 })
  })

  it('rejects assignment to an outlet owned by another vendor', async () => {
    const payload = createPayload([{ id: 3, vendor: 8, isActive: true }])

    await expect(resolveVendorProductOutlets(payload as never, 7, { scope: 'outlet', outletId: 3 }))
      .rejects.toMatchObject({ status: 403 })
  })

  it('rejects assignment to an inactive outlet', async () => {
    const payload = createPayload([{ id: 3, vendor: 7, isActive: false }])

    await expect(resolveVendorProductOutlets(payload as never, 7, { scope: 'outlet', outletId: 3 }))
      .rejects.toMatchObject({ status: 400 })
  })
})

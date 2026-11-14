import { describe, expect, it } from 'vitest'
import {
  buildLalamoveOrderRemarks,
  getLalamoveItemQuantity,
  LalamoveRemarksLimitError,
} from '../../src/services/lalamoveOrderRemarks'

const totals = {
  subtotal: 850,
  deliveryFee: 49,
  total: 849,
}

describe('Lalamove order remarks', () => {
  it('includes item snapshots, option names, item pricing, checkout totals, and rider instructions', () => {
    const remarks = buildLalamoveOrderRemarks({
      orderId: 123,
      merchantName: 'Tap2Go Cafe',
      items: [{
        product_name_snapshot: 'Chicken Adobo',
        quantity: 2,
        price_at_purchase: 200,
        total_price: 400,
        options_snapshot: [
          { entryType: 'variation', name: 'Large' },
          { entryType: 'modifier', groupName: 'Spice Level', name: 'Extra rice' },
        ],
      }],
      totals,
      lalamoveQuote: { total: '60.00', currency: 'PHP' },
      instructions: 'Call on arrival',
    })

    expect(remarks).toContain('ORDER #123')
    expect(remarks).toContain('MERCHANT: Tap2Go Cafe')
    expect(remarks).toContain('Chicken Adobo (Variation: Large; Spice Level: Extra rice) x2 @ PHP 200.00 each = PHP 400.00')
    expect(remarks).toContain('Items subtotal: PHP 850.00')
    expect(remarks).toContain('Checkout delivery fee: PHP 49.00')
    expect(remarks).not.toContain('Checkout priority fee')
    expect(remarks).not.toContain('Platform/service fee')
    expect(remarks).not.toContain('Discount:')
    expect(remarks).toContain('TOTAL PAID AT CHECKOUT: PHP 849.00')
    expect(remarks).toContain('Lalamove delivery quote (before any priority add-on): PHP 60.00')
    expect(remarks).toContain('RIDER INSTRUCTIONS: Call on arrival')
  })

  it('sends the aggregate item quantity in Lalamove quotation format', () => {
    expect(getLalamoveItemQuantity([
      { quantity: 2 },
      { quantity: 3 },
      { quantity: 'invalid' },
    ])).toBe(5)
  })

  it('includes variable attributes and grouped-product parent context', () => {
    const remarks = buildLalamoveOrderRemarks({
      orderId: 123,
      merchantName: 'Tap2Go Cafe',
      items: [{
        product_name_snapshot: 'Porterhouse Beef Steak',
        quantity: 1,
        price_at_purchase: 759,
        total_price: 759,
        options_snapshot: [
          {
            entryType: 'variation',
            name: '4 slices, 490g',
            selectedVariationName: '4 slices, 490g',
            variationAttributes: [
              { attributeName: 'Pack Size', termName: '4 slices, 490g' },
            ],
          },
          {
            entryType: 'grouped',
            name: 'Steak Dinner Bundle',
            groupedProductName: 'Steak Dinner Bundle',
          },
        ],
      }],
      totals,
      lalamoveQuote: { total: '60.00', currency: 'PHP' },
    })

    expect(remarks).toContain('Variation: 4 slices, 490g; Attributes: Pack Size: 4 slices, 490g')
    expect(remarks).toContain('Grouped product: Steak Dinner Bundle')
  })

  it('fails instead of silently omitting order items when remarks exceed Lalamove’s limit', () => {
    expect(() => buildLalamoveOrderRemarks({
      orderId: 123,
      merchantName: 'Tap2Go Cafe',
      items: Array.from({ length: 30 }, (_, index) => ({
        product_name_snapshot: `Menu item ${index + 1}`,
        quantity: 1,
        price_at_purchase: 100,
        total_price: 100,
      })),
      totals,
      lalamoveQuote: { total: '60.00', currency: 'PHP' },
      instructions: 'Call on arrival',
    })).toThrow(LalamoveRemarksLimitError)
  })

  it('fails rather than sending a placeholder when the order has no saved item lines', () => {
    expect(() => buildLalamoveOrderRemarks({
      orderId: 123,
      merchantName: 'Tap2Go Cafe',
      items: [],
      totals,
      lalamoveQuote: { total: '60.00', currency: 'PHP' },
    })).toThrow('The order has no saved item details')
  })
})

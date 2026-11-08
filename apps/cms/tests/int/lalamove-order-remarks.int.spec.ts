import { describe, expect, it } from 'vitest'
import {
  buildLalamoveOrderRemarks,
  getLalamoveItemQuantity,
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
          { entryType: 'modifier', name: 'Extra rice' },
        ],
      }],
      totals,
      lalamoveQuote: { total: '60.00', currency: 'PHP' },
      instructions: 'Call on arrival',
    })

    expect(remarks).toContain('ORDER #123')
    expect(remarks).toContain('MERCHANT: Tap2Go Cafe')
    expect(remarks).toContain('Chicken Adobo (Large, Extra rice) x2 @ PHP 200.00 each = PHP 400.00')
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

  it('keeps remarks within Lalamove’s 1,500-character limit and preserves the total', () => {
    const remarks = buildLalamoveOrderRemarks({
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
    })

    expect(remarks.length).toBeLessThanOrEqual(1500)
    expect(remarks).toContain('TOTAL PAID AT CHECKOUT: PHP 849.00')
    expect(remarks).toContain('more item(s) omitted')
  })
})

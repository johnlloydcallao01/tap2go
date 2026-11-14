import { describe, expect, it, vi } from 'vitest'
import { buildCustomerOrderDetail } from '../../src/services/customerOrderDetail'

describe('customer order detail', () => {
  it('builds a rider-remarks preview from the saved order before a Lalamove booking exists', async () => {
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'pending',
              fulfillment_type: 'delivery',
              total: 180,
              subtotal: 100,
              delivery_fee: 80,
              merchant: 12,
            }],
          }
        }
        if (collection === 'merchants') {
          return {
            docs: [{
              id: 12,
              outletName: 'Sample Outlet',
            }],
          }
        }
        if (collection === 'order-items') {
          return {
            docs: [{
              id: 1,
              product_name_snapshot: 'Porterhouse Beef Steak',
              quantity: 1,
              price_at_purchase: 100,
              total_price: 100,
              options_snapshot: [{
                entryType: 'variation',
                selectedVariationName: '4 slices, 490g',
                variationAttributes: [{ attributeName: 'Weight', termName: '490g' }],
              }],
            }],
          }
        }
        if (collection === 'delivery-bookings') return { docs: [] }
        if (collection === 'delivery-locations') {
          return { docs: [{ delivery_instructions: 'Call on arrival' }] }
        }
        return { docs: [] }
      }),
    }

    const result = await buildCustomerOrderDetail(payload as never, 7, 95)

    expect(result?.delivery).toBeNull()
    expect(result?.riderRemarksPreview).toContain('MERCHANT: Sample Outlet')
    expect(result?.riderRemarksPreview).toContain('Variation: 4 slices, 490g; Attributes: Weight: 490g')
    expect(result?.riderRemarksPreview).toContain('RIDER INSTRUCTIONS: Call on arrival')
  })

  it('populates and returns the vendor logo for the merchant header', async () => {
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'delivered',
              merchant: 12,
            }],
          }
        }
        if (collection === 'merchants') {
          return {
            docs: [{
              id: 12,
              outletName: 'Sample Outlet',
              vendor: {
                businessName: 'Sample Vendor',
                logo: {
                  cloudinaryURL: 'https://example.com/vendor-logo.png',
                },
              },
              contactInfo: { phone: '09123456789' },
            }],
          }
        }
        return { docs: [] }
      }),
    }

    const result = await buildCustomerOrderDetail(payload as never, 7, 95)

    expect(result?.merchant).toMatchObject({
      name: 'Sample Outlet',
      logo: 'https://example.com/vendor-logo.png',
    })
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'merchants',
      depth: 2,
      where: { id: { equals: 12 } },
    }))
  })
})

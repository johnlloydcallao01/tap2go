import { describe, expect, it, vi } from 'vitest'
import { buildCustomerOrderDetail } from '../../src/services/customerOrderDetail'

describe('customer order detail', () => {
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

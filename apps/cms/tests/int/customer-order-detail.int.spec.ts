import { describe, expect, it, vi } from 'vitest'
import { buildCustomerOrderDetail } from '../../src/services/customerOrderDetail'

const { getDeliveryProvider } = vi.hoisted(() => ({
  getDeliveryProvider: vi.fn(),
}))

vi.mock('../../src/services/deliveryProviders', () => ({
  getDeliveryProvider,
}))

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

  it('returns the amount of an unpaid priority-fee payment so it can be resumed', async () => {
    getDeliveryProvider.mockResolvedValue({
      getOrderDetails: vi.fn(async () => ({ status: 'ASSIGNING_DRIVER' })),
    })
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'accepted',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
              total: 25,
              subtotal: 25,
              delivery_fee: 0,
              merchant: 12,
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95' }] }
        }
        if (collection === 'order-items') {
          return {
            docs: [{
              id: 1,
              product_name_snapshot: 'Sample item',
              quantity: 1,
              price_at_purchase: 25,
              total_price: 25,
            }],
          }
        }
        if (collection === 'transactions') {
          return {
            docs: [
              {
                id: 501,
                amount: 25,
                currency: 'PHP',
                payment_method: 'gcash',
                status: 'pending',
                transaction_type: 'priority_fee',
                priority_fee_fulfillment_status: 'pending',
                createdAt: '2026-11-24T10:00:00.000Z',
              },
              {
                id: 500,
                amount: 5,
                currency: 'PHP',
                payment_method: 'grab_pay',
                status: 'paid',
                transaction_type: 'priority_fee',
                priority_fee_fulfillment_status: 'applied',
                priority_fee_total: 25,
                paid_at: '2026-11-24T09:00:00.000Z',
                createdAt: '2026-11-24T08:59:00.000Z',
              },
            ],
          }
        }
        return { docs: [] }
      }),
    }

    const result = await buildCustomerOrderDetail(payload as never, 7, 95)

    expect(result?.priorityFeePaymentPending).toBe(true)
    expect(result?.priorityFeePaymentAmount).toBe(25)
    expect(result?.priorityFeeAddedTotal).toBe(5)
    expect(result?.priorityFeeHistory).toEqual([
      {
        id: 501,
        amount: 25,
        currency: 'PHP',
        paymentMethod: 'gcash',
        status: 'pending',
        fulfillmentStatus: 'pending',
        priorityFeeTotal: null,
        paidAt: null,
        createdAt: '2026-11-24T10:00:00.000Z',
      },
      {
        id: 500,
        amount: 5,
        currency: 'PHP',
        paymentMethod: 'grab_pay',
        status: 'paid',
        fulfillmentStatus: 'applied',
        priorityFeeTotal: 25,
        paidAt: '2026-11-24T09:00:00.000Z',
        createdAt: '2026-11-24T08:59:00.000Z',
      },
    ])
  })

  it('returns the eligibility reason instead of offering resume for a delivered order', async () => {
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'delivered',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
              total: 25,
              subtotal: 25,
              delivery_fee: 0,
              merchant: 12,
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95' }] }
        }
        if (collection === 'order-items') {
          return {
            docs: [{
              id: 1,
              product_name_snapshot: 'Sample item',
              quantity: 1,
              price_at_purchase: 25,
              total_price: 25,
            }],
          }
        }
        if (collection === 'transactions') {
          return {
            docs: [{
              id: 501,
              amount: 25,
              status: 'pending',
              transaction_type: 'priority_fee',
              priority_fee_fulfillment_status: 'pending',
            }],
          }
        }
        return { docs: [] }
      }),
    }

    const result = await buildCustomerOrderDetail(payload as never, 7, 95)

    expect(result?.priorityFeePaymentUnavailableReason).toBe(
      'Tap2Go has marked this order "delivered", so a priority fee can no longer be added.',
    )
  })
})

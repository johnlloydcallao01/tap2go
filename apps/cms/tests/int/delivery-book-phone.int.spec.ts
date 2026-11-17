import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDeliveryProvider } = vi.hoisted(() => ({
  getDeliveryProvider: vi.fn(),
}))

vi.mock('../../src/services/deliveryProviders', () => ({
  getDeliveryProvider,
  mapLalamoveStatus: vi.fn(),
}))

import { deliveryBookHandler } from '../../src/endpoints/deliveryBook'

describe('delivery booking contact validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['sender', 'not-a-phone', '+639468748743'],
    ['recipient', '', 'local 123'],
  ])('rejects an invalid %s before requesting a quotation', async (_label, senderPhone, recipientPhone) => {
    const req = {
      payload: {
        findByID: vi.fn(async () => order(senderPhone)),
        find: vi.fn(async ({ collection }: { collection: string }) => {
          if (collection === 'transactions') return { docs: [{ id: 20 }] }
          if (collection === 'delivery-locations') {
            return { docs: [{ coordinates: { lat: 14, lng: 121 }, contact_name: 'Customer', contact_phone: recipientPhone }] }
          }
          return { docs: [] }
        }),
      },
    }

    const response = await deliveryBookHandler(req as any, 17, {
      requestId: 'test-request',
      onRemarksPrepared: vi.fn(async () => undefined),
      onProviderSubmissionStarted: vi.fn(),
      onProviderAccepted: vi.fn(async () => undefined),
    })

    expect(response.status).toBe(422)
    expect(getDeliveryProvider).not.toHaveBeenCalled()
  })
})

function order(senderPhone: string) {
  return {
    id: 17,
    fulfillment_type: 'delivery',
    merchant: {
      outletName: 'Test Merchant',
      contactInfo: { phone: senderPhone },
      merchant_latitude: 14,
      merchant_longitude: 121,
    },
    customer: {
      user: { firstName: 'Test', lastName: 'Customer', phone: '09468748743' },
    },
    status: 'accepted',
  }
}

import { describe, expect, it, vi } from 'vitest'
import { merchantViewHandler } from '../../src/endpoints/merchantView'

describe('merchant view customer information', () => {
  it('selects customer-facing profile and store-hours fields without private contact data', async () => {
    const operatingHours = {
      monday: [{ open: '00:00', close: '00:00' }],
      tuesday: [{ open: '00:00', close: '00:00' }],
      wednesday: [{ open: '00:00', close: '00:00' }],
      thursday: [{ open: '00:00', close: '00:00' }],
      friday: [{ open: '00:00', close: '00:00' }],
      saturday: [{ open: '00:00', close: '00:00' }],
      sunday: [{ open: '00:00', close: '00:00' }],
    }
    const findByID = vi.fn().mockResolvedValue({
      id: 31,
      outletName: 'Sample Outlet',
      isActive: true,
      isAcceptingOrders: true,
      vacationMode: false,
      timezone: 'Asia/Manila',
      operatingHours,
      specialHours: [],
      delivery_hours: null,
      vendor: {
        id: 5,
        businessName: 'Sample Business',
        legalName: 'Private Legal Name',
        businessType: 'restaurant',
      },
      media: { thumbnail: { id: 2, url: '/thumb.jpg', filename: 'private-file-name.jpg' } },
      activeAddress: {
        id: 6,
        formatted_address: '1 Sample Street',
        street_number: '1',
        route: 'Sample Street',
        barangay: 'Barangay One',
        locality: 'Sample City',
        latitude: 14.5995,
        longitude: 120.9842,
        user: { id: 900, email: 'private@example.com' },
        delivery_instructions: 'Private directions',
      },
      contactInfo: {
        phone: '09123456789',
        email: 'outlet@example.com',
        managerName: 'Private Manager',
        managerPhone: '09999999999',
      },
      description: 'A customer-facing outlet description.',
      specialInstructions: 'Please use the side entrance for pickup.',
      merchant_categories: [{ id: 8, name: 'Cafe', slug: 'cafe' }],
      deliverySettings: { minimumOrderAmount: 100, estimatedDeliveryTimeMinutes: 30 },
      is_currently_delivering: true,
    })

    const response = await merchantViewHandler({
      user: { role: 'service' },
      query: { merchantId: '31' },
      payload: { findByID },
    } as never)

    expect(response.status).toBe(200)
    const result = await response.json()
    expect(result.data).toMatchObject({
      id: 31,
      description: 'A customer-facing outlet description.',
      specialInstructions: 'Please use the side entrance for pickup.',
      contactInfo: { phone: '09123456789', email: 'outlet@example.com' },
      activeAddress: {
        formatted_address: '1 Sample Street',
        street_number: '1',
        route: 'Sample Street',
        barangay: 'Barangay One',
        locality: 'Sample City',
        latitude: 14.5995,
        longitude: 120.9842,
      },
      operatingHours,
      timezone: 'Asia/Manila',
      isOpenNow: true,
      merchant_categories: [{ id: 8, name: 'Cafe', slug: 'cafe' }],
      deliverySettings: { minimumOrderAmount: 100, estimatedDeliveryTimeMinutes: 30 },
    })
    expect(result.data.vendor).not.toHaveProperty('legalName')
    expect(result.data.activeAddress).not.toHaveProperty('user')
    expect(result.data.activeAddress).not.toHaveProperty('delivery_instructions')
    expect(result.data.contactInfo).not.toHaveProperty('managerName')
    expect(result.data.media.thumbnail).not.toHaveProperty('filename')

    const select = findByID.mock.calls[0][0].select
    expect(select.contactInfo).toEqual({ phone: true, email: true })
    expect(select).not.toHaveProperty('delivery_zones')
  })
})

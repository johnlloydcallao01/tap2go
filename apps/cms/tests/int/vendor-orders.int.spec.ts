import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authenticateVendor, bustOrderItemsCache, bustOrdersCache, getDeliveryProvider, getPayload } = vi.hoisted(() => ({
  authenticateVendor: vi.fn(),
  bustOrderItemsCache: vi.fn(async () => undefined),
  bustOrdersCache: vi.fn(async () => undefined),
  getDeliveryProvider: vi.fn(),
  getPayload: vi.fn(),
}))

vi.mock('payload', () => ({ buildConfig: (config: unknown) => config, getPayload }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('../../src/utils/mediaLibrary', () => ({ authenticateVendor }))
vi.mock('../../src/utils/dashboardCache', () => ({ bustOrderItemsCache, bustOrdersCache }))
vi.mock('../../src/services/deliveryProviders', () => ({
  getDeliveryProvider,
  mapLalamoveStatus: (status: string) => ({
    PENDING: 'pending',
    ASSIGNING_DRIVER: 'assigning_driver',
    DRIVER_ASSIGNED: 'driver_assigned',
    ON_GOING: 'driver_assigned',
    PICKED_UP: 'picked_up',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  }[status] || 'pending'),
  mapToOrderStatus: (status: string) => ({
    assigning_driver: 'preparing',
    driver_assigned: 'ready_for_pickup',
    picked_up: 'on_delivery',
    completed: 'delivered',
    canceled: 'cancelled',
    expired: 'cancelled',
  }[status] || null),
}))

import { NextRequest } from 'next/server'
import { POST as createOrder } from '../../src/app/api/vendor/orders/route'
import {
  DELETE as deleteOrder,
  GET as getOrder,
  PATCH as updateOrder,
} from '../../src/app/api/vendor/orders/[id]/route'

const vendorUser = { id: 7, role: 'vendor' }
const ownOrder = {
  id: 55,
  customer: 8,
  merchant: 10,
  status: 'pending',
  fulfillment_type: 'delivery',
  subtotal: 12,
  delivery_fee: 0,
  platform_fee: 0,
  priority_fee: 0,
  discount_total: 0,
  total: 12,
}

function makePayload(options: {
  customerHasOrder?: boolean
  orderIsOwned?: boolean
  orderStatus?: string
  orderFulfillmentType?: 'delivery' | 'pickup'
  orderDeliveryStatus?: string
  orderLalamoveOrderId?: string | null
  booking?: Record<string, unknown>
  deleteError?: Error
} = {}) {
  const find = vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, any> }) => {
    if (collection === 'vendors') return { docs: [{ id: 21 }] }
    if (collection === 'merchants') return { docs: [{ id: 10 }] }
    if (collection === 'orders') {
      const filters = where?.and as Array<Record<string, any>> | undefined
      if (filters?.some((filter) => filter.id?.equals === 55)) {
        return {
          docs: options.orderIsOwned === false
            ? []
            : [{
                ...ownOrder,
                status: options.orderStatus || ownOrder.status,
                fulfillment_type: options.orderFulfillmentType || ownOrder.fulfillment_type,
                delivery_status: options.orderDeliveryStatus || ownOrder.delivery_status,
                lalamove_order_id: options.orderLalamoveOrderId ?? ownOrder.lalamove_order_id,
              }],
        }
      }
      return { docs: options.customerHasOrder === false ? [] : [{ id: 30 }] }
    }
    if (collection === 'delivery-bookings') {
      return { docs: options.booking ? [options.booking] : [] }
    }
    return { docs: [] }
  })
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 90, ...data }))
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ ...ownOrder, ...data }))
  const remove = vi.fn(async () => {
    if (options.deleteError) throw options.deleteError
    return { id: 55 }
  })
  return { find, create, update, delete: remove }
}

function request(path: string, method: string, body?: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('vendor order CRUD scope', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateVendor.mockResolvedValue(vendorUser)
  })

  it('creates an order only for an outlet owned by the authenticated vendor', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await createOrder(request('/api/vendor/orders?userId=999', 'POST', {
      customer: 8,
      merchant: 10,
      fulfillment_type: 'delivery',
      subtotal: 12.34,
    }))
    const result = await response.json()

    expect(response.status).toBe(201)
    expect(result.doc.id).toBe(90)
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      data: expect.objectContaining({ customer: 8, merchant: 10, total: 12.34 }),
      overrideAccess: true,
    }))
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'vendors',
      where: { user: { equals: '7' } },
    }))
  })

  it('rejects creation for an outlet outside the vendor scope', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await createOrder(request('/api/vendor/orders', 'POST', {
      customer: 8,
      merchant: 99,
      fulfillment_type: 'delivery',
    }))

    expect(response.status).toBe(403)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('rejects customers with no order history at the vendor outlets', async () => {
    const payload = makePayload({ customerHasOrder: false })
    getPayload.mockResolvedValue(payload)

    const response = await createOrder(request('/api/vendor/orders', 'POST', {
      customer: 88,
      merchant: 10,
      fulfillment_type: 'delivery',
    }))

    expect(response.status).toBe(403)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('rejects attempts to set Lalamove-managed delivery fields', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await createOrder(request('/api/vendor/orders', 'POST', {
      customer: 8,
      merchant: 10,
      fulfillment_type: 'delivery',
      delivery_status: 'completed',
    }))

    expect(response.status).toBe(400)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('requires new delivery orders to begin pending', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await createOrder(request('/api/vendor/orders', 'POST', {
      customer: 8,
      merchant: 10,
      fulfillment_type: 'delivery',
      status: 'accepted',
    }))

    expect(response.status).toBe(400)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('rejects updates to an order outside the authenticated vendor scope', async () => {
    const payload = makePayload({ orderIsOwned: false })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'accepted' }),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(404)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects moving an owned order to another vendor outlet', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { merchant: 99 }),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(403)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('updates an owned order while preserving the amount invariant and status history', async () => {
    const payload = makePayload({ orderFulfillmentType: 'pickup' })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', {
        status: 'accepted',
        subtotal: 15,
        total: 15,
        description: 'Vendor accepted the order',
      }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.status).toBe('accepted')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      data: expect.objectContaining({ status: 'accepted', subtotal: 15, total: 15 }),
      overrideAccess: true,
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'order-tracking',
      data: expect.objectContaining({ actor: vendorUser.id, description: 'Vendor accepted the order' }),
      overrideAccess: true,
    }))
  })

  it('allows a vendor to accept a pending delivery order', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'accepted' }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.status).toBe('accepted')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      data: expect.objectContaining({ status: 'accepted' }),
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'order-tracking',
      data: expect.objectContaining({ status: 'accepted', actor: vendorUser.id }),
    }))
  })

  it('allows a vendor to return an accepted delivery order to pending before Lalamove progresses', async () => {
    const payload = makePayload({ orderStatus: 'accepted' })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'pending' }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.status).toBe('pending')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      data: expect.objectContaining({ status: 'pending' }),
    }))
  })

  it('allows a vendor to cancel a pickup order and records the status change', async () => {
    const payload = makePayload({ orderFulfillmentType: 'pickup' })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'cancelled' }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.status).toBe('cancelled')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      data: expect.objectContaining({ status: 'cancelled' }),
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'order-tracking',
      data: expect.objectContaining({ status: 'cancelled', actor: vendorUser.id }),
    }))
    expect(getDeliveryProvider).not.toHaveBeenCalled()
  })

  it('cancels an eligible Lalamove order through the provider and refunds the delivery fee', async () => {
    const payload = makePayload({
      booking: {
        id: 80,
        order: 55,
        lalamove_order_id: 'lala-123',
        delivery_fee: 5,
        status: 'assigning_driver',
      },
    })
    getPayload.mockResolvedValue(payload)
    const cancelProviderOrder = vi.fn(async () => undefined)
    getDeliveryProvider.mockResolvedValue({ cancelOrder: cancelProviderOrder })

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'cancelled' }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.status).toBe('cancelled')
    expect(cancelProviderOrder).toHaveBeenCalledWith('lala-123')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-bookings',
      id: 80,
      data: expect.objectContaining({ status: 'canceled', lalamove_raw_status: 'CANCELED' }),
    }))
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      data: expect.objectContaining({ status: 'cancelled', delivery_status: 'canceled', delivery_fee: 0 }),
    }))
  })

  it('rejects a Lalamove cancellation when the provider forbids it', async () => {
    const payload = makePayload({
      booking: {
        id: 80,
        order: 55,
        lalamove_order_id: 'lala-123',
        status: 'assigning_driver',
      },
    })
    getPayload.mockResolvedValue(payload)
    const cancelProviderOrder = vi.fn(async () => {
      throw Object.assign(new Error('Cancellation forbidden'), { isCancellationForbidden: true })
    })
    getDeliveryProvider.mockResolvedValue({ cancelOrder: cancelProviderOrder })

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'cancelled' }),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(409)
    expect(result.code).toBe('ERR_CANCELLATION_FORBIDDEN')
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects cancelling a delivery after Lalamove has progressed beyond the allowed window', async () => {
    const payload = makePayload({
      orderStatus: 'ready_for_pickup',
      booking: {
        id: 80,
        order: 55,
        lalamove_order_id: 'lala-123',
        status: 'driver_assigned',
      },
    })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'cancelled' }),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(409)
    expect(getDeliveryProvider).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects manual changes to Lalamove delivery progress', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'preparing' }),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(409)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('rejects accepting a delivery after Lalamove has started assigning a driver', async () => {
    const payload = makePayload({
      booking: {
        id: 80,
        order: 55,
        lalamove_order_id: 'lala-123',
        status: 'assigning_driver',
      },
    })
    getPayload.mockResolvedValue(payload)

    const response = await updateOrder(
      request('/api/vendor/orders/55', 'PATCH', { status: 'accepted' }),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(409)
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('refreshes owned delivery status from Lalamove and persists the mapped status', async () => {
    const payload = makePayload({
      booking: {
        id: 80,
        order: 55,
        lalamove_order_id: 'lala-123',
        status: 'assigning_driver',
        service_type: 'MOTORCYCLE',
      },
    })
    getPayload.mockResolvedValue(payload)
    const getOrderDetails = vi.fn(async () => ({ status: 'DRIVER_ASSIGNED' }))
    getDeliveryProvider.mockResolvedValue({ name: 'lalamove', getOrderDetails })

    const response = await getOrder(
      request('/api/vendor/orders/55?refresh=true', 'GET'),
      { params: Promise.resolve({ id: '55' }) },
    )
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.doc.deliveryStatusSource).toBe('lalamove')
    expect(result.doc.booking.status).toBe('driver_assigned')
    expect(result.doc.status).toBe('ready_for_pickup')
    expect(getOrderDetails).toHaveBeenCalledWith('lala-123')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-bookings',
      id: 80,
      data: expect.objectContaining({ status: 'driver_assigned', lalamove_raw_status: 'DRIVER_ASSIGNED' }),
    }))
  })

  it('deletes an owned order through Payload', async () => {
    const payload = makePayload()
    getPayload.mockResolvedValue(payload)

    const response = await deleteOrder(
      request('/api/vendor/orders/55', 'DELETE'),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(200)
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      overrideAccess: true,
    }))
  })

  it('preserves the paid/refunded transaction deletion safeguard', async () => {
    const payload = makePayload({
      deleteError: new Error('Order #55 has a paid or refunded transaction and cannot be permanently deleted.'),
    })
    getPayload.mockResolvedValue(payload)

    const response = await deleteOrder(
      request('/api/vendor/orders/55', 'DELETE'),
      { params: Promise.resolve({ id: '55' }) },
    )

    expect(response.status).toBe(409)
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'orders',
      id: 55,
      overrideAccess: true,
    }))
  })
})

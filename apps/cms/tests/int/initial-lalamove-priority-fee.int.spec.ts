import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitInitialLalamovePriorityFee } from '../../src/services/initialLalamovePriorityFee'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('initial Lalamove priority fee', () => {
  it('submits a two-decimal amount and trusts the fee confirmed in Lalamove response', async () => {
    const addPriorityFee = vi.fn().mockResolvedValue({
      priceBreakdown: { priorityFee: '25.00' },
    })
    const getOrderDetails = vi.fn()

    await expect(submitInitialLalamovePriorityFee({
      provider: { addPriorityFee, getOrderDetails } as never,
      orderId: 'lal-123',
      requestedFee: 25,
      orderStatus: 'ASSIGNING_DRIVER',
    })).resolves.toBe(25)

    expect(addPriorityFee).toHaveBeenCalledWith('lal-123', '25.00')
    expect(getOrderDetails).not.toHaveBeenCalled()
  })

  it('does not attempt a fee after Lalamove reports that a driver has accepted', async () => {
    const addPriorityFee = vi.fn()
    const getOrderDetails = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(submitInitialLalamovePriorityFee({
      provider: { addPriorityFee, getOrderDetails } as never,
      orderId: 'lal-123',
      requestedFee: 25,
      orderStatus: 'ON_GOING',
    })).resolves.toBe(0)

    expect(addPriorityFee).not.toHaveBeenCalled()
  })

  it('reconciles an ambiguous add-fee response without submitting a duplicate fee', async () => {
    const addPriorityFee = vi.fn().mockRejectedValue(new Error('request timed out'))
    const getOrderDetails = vi.fn().mockResolvedValue({
      priceBreakdown: { priorityFee: '25' },
    })
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(submitInitialLalamovePriorityFee({
      provider: { addPriorityFee, getOrderDetails } as never,
      orderId: 'lal-123',
      requestedFee: 25,
      orderStatus: 'ASSIGNING_DRIVER',
    })).resolves.toBe(25)

    expect(addPriorityFee).toHaveBeenCalledOnce()
    expect(getOrderDetails).toHaveBeenCalledOnce()
  })

  it('records zero when Lalamove rejects the fee and order details confirm no fee', async () => {
    const addPriorityFee = vi.fn().mockRejectedValue(new Error('ERR_EXCEED_MAX_TIPS'))
    const getOrderDetails = vi.fn().mockResolvedValue({
      priceBreakdown: { priorityFee: '0' },
    })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(submitInitialLalamovePriorityFee({
      provider: { addPriorityFee, getOrderDetails } as never,
      orderId: 'lal-123',
      requestedFee: 25,
      orderStatus: 'ASSIGNING_DRIVER',
    })).resolves.toBe(0)

    expect(addPriorityFee).toHaveBeenCalledOnce()
    expect(getOrderDetails).toHaveBeenCalledOnce()
  })
})

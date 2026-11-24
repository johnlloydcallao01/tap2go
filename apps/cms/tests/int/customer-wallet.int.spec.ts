import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkoutPaymentResumeHandler,
} from '../../src/endpoints/checkoutPaymentResume'
import {
  customerWalletTopupCancelHandler,
  reconcileWalletTopupByIntent,
} from '../../src/endpoints/customerWallet'
import {
  debitWalletForOrder,
  InsufficientWalletBalanceError,
} from '../../src/services/customerWallet'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function createWalletRequest(existingLedgerEntry = false) {
  const topup = {
    id: 12,
    wallet: 3,
    amount_minor: 5000,
    currency: 'PHP',
    status: 'pending',
  }
  const wallet = { id: 3, balance_minor: 2500, currency: 'PHP' }
  const payload = {
    find: vi.fn(async ({ collection }: { collection: string }) => ({
      docs: collection === 'wallet-topups'
        ? [topup]
        : existingLedgerEntry && collection === 'wallet-ledger-entries'
          ? [{ id: 31 }]
          : [],
    })),
    findByID: vi.fn(async ({ collection }: { collection: string }) => (
      collection === 'wallet-topups' ? topup : wallet
    )),
    update: vi.fn(async () => wallet),
    create: vi.fn(async () => ({ id: 31 })),
    db: {
      beginTransaction: vi.fn(async () => 'wallet-tx'),
      commitTransaction: vi.fn(async () => undefined),
      rollbackTransaction: vi.fn(async () => undefined),
      sessions: {
        'wallet-tx': {
          db: { execute: vi.fn(async () => ({ rows: [{ id: 3 }] })) },
        },
      },
    },
  }
  return { payload, req: { payload, transactionID: undefined } }
}

describe('customer wallet top-up settlement', () => {
  it('credits a matching successful PayMongo top-up exactly once', async () => {
    const { payload, req } = createWalletRequest()

    await expect(reconcileWalletTopupByIntent(
      req as any,
      'pi_wallet_topup',
      {
        id: 'pi_wallet_topup',
        attributes: { status: 'succeeded', amount: 5000, currency: 'PHP' },
      },
      'pay_wallet_topup',
      '2026-01-01T00:00:00.000Z',
    )).resolves.toBe(true)

    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'customer-wallets',
      id: 3,
      data: { balance_minor: 7500 },
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-ledger-entries',
      data: expect.objectContaining({
        source_type: 'wallet_topup',
        source_id: '12',
        amount_minor: 5000,
      }),
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('wallet-tx')
    expect(payload.db.rollbackTransaction).not.toHaveBeenCalled()
  })

  it('rejects amount or currency mismatches before changing the wallet', async () => {
    const { payload, req } = createWalletRequest()

    await expect(reconcileWalletTopupByIntent(
      req as any,
      'pi_wallet_topup',
      {
        id: 'pi_wallet_topup',
        attributes: { status: 'succeeded', amount: 4999, currency: 'PHP' },
      },
      'pay_wallet_topup',
      '2026-01-01T00:00:00.000Z',
    )).rejects.toThrow('does not match the saved amount or currency')

    expect(payload.db.beginTransaction).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('does not credit again when the top-up already has a ledger entry', async () => {
    const { payload, req } = createWalletRequest(true)

    await expect(reconcileWalletTopupByIntent(
      req as any,
      'pi_wallet_topup',
      {
        id: 'pi_wallet_topup',
        attributes: { status: 'succeeded', amount: 5000, currency: 'PHP' },
      },
      'pay_wallet_topup',
      '2026-01-01T00:00:00.000Z',
    )).resolves.toBe(true)

    expect(payload.update).toHaveBeenCalledTimes(1)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-topups',
      data: expect.objectContaining({ status: 'paid' }),
    }))
    expect(payload.create).not.toHaveBeenCalled()
  })
})

describe('customer wallet top-up cancellation', () => {
  function createCancelRequest() {
    const topup = {
      id: 12,
      customer: 2,
      wallet: 3,
      amount_minor: 5000,
      currency: 'PHP',
      status: 'pending',
      payment_intent_id: 'pi_wallet_topup',
    }
    const wallet = { id: 3, balance_minor: 2500, currency: 'PHP' }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'customers'
          ? [{ id: 2 }]
          : collection === 'wallet-topups'
            ? [topup]
            : [],
      })),
      findByID: vi.fn(async ({ collection }: { collection: string }) => (
        collection === 'wallet-topups' ? topup : wallet
      )),
      update: vi.fn(async () => topup),
      create: vi.fn(async () => ({ id: 31 })),
      db: {
        beginTransaction: vi.fn(async () => 'wallet-cancel-tx'),
        commitTransaction: vi.fn(async () => undefined),
        rollbackTransaction: vi.fn(async () => undefined),
        sessions: {
          'wallet-cancel-tx': {
            db: { execute: vi.fn(async () => ({ rows: [{ id: 12 }] })) },
          },
        },
      },
    }
    const req = {
      user: { id: 42, role: 'customer' },
      json: async () => ({ topupId: 12 }),
      payload,
      transactionID: undefined,
    }
    return { payload, req }
  }

  it('cancels the PayMongo intent before allowing a fresh top-up', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    const { payload, req } = createCancelRequest()
    const fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'pi_wallet_topup', attributes: { status: 'awaiting_next_action' } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'pi_wallet_topup', attributes: { status: 'canceled' } },
        }),
      })
    vi.stubGlobal('fetch', fetch)

    const response = await customerWalletTopupCancelHandler(req as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ state: 'cancelled' })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe(
      'https://api.paymongo.com/v1/payment_intents/pi_wallet_topup/cancel',
    )
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-topups',
      id: 12,
      data: { status: 'failed' },
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('wallet-cancel-tx')
    expect(payload.db.rollbackTransaction).not.toHaveBeenCalled()
  })

  it('keeps a processing payment active instead of allowing a second top-up', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    const { payload, req } = createCancelRequest()
    const fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'pi_wallet_topup', attributes: { status: 'processing' } },
      }),
    })
    vi.stubGlobal('fetch', fetch)

    const response = await customerWalletTopupCancelHandler(req as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ state: 'processing' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.db.beginTransaction).not.toHaveBeenCalled()
  })

  it('settles an already-paid attempt instead of cancelling or failing it', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    const { payload, req } = createCancelRequest()
    const fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_wallet_topup',
          attributes: {
            status: 'succeeded',
            amount: 5000,
            currency: 'PHP',
            paid_at: 1767225600,
            payments: [{ id: 'pay_wallet_topup' }],
          },
        },
      }),
    })
    vi.stubGlobal('fetch', fetch)

    const response = await customerWalletTopupCancelHandler(req as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ state: 'paid' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'customer-wallets',
      id: 3,
      data: { balance_minor: 7500 },
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-ledger-entries',
      data: expect.objectContaining({ source_id: '12', amount_minor: 5000 }),
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('wallet-cancel-tx')
  })
})

describe('wallet order debits', () => {
  function createDebitRequest(balanceMinor: number) {
    const wallet = { id: 3, balance_minor: balanceMinor, currency: 'PHP' }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'customer-wallets' ? [wallet] : [],
      })),
      findByID: vi.fn(async () => wallet),
      update: vi.fn(async () => wallet),
      create: vi.fn(async () => ({ id: 31 })),
      db: {
        sessions: {
          'wallet-tx': { db: { execute: vi.fn(async () => ({ rows: [{ id: 3 }] })) } },
        },
      },
    }
    return { payload, req: { payload, transactionID: 'wallet-tx' } }
  }

  it('debits the balance and records the order ledger entry', async () => {
    const { payload, req } = createDebitRequest(7500)

    await debitWalletForOrder(req as any, 5, 28, 5000)

    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'customer-wallets',
      data: { balance_minor: 2500 },
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-ledger-entries',
      data: expect.objectContaining({
        source_type: 'order',
        source_id: '28',
        amount_minor: -5000,
      }),
    }))
  })

  it('rejects an insufficient balance without changing the wallet', async () => {
    const { payload, req } = createDebitRequest(4999)

    await expect(debitWalletForOrder(req as any, 5, 28, 5000))
      .rejects.toBeInstanceOf(InsufficientWalletBalanceError)

    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.create).not.toHaveBeenCalled()
  })
})

describe('wallet payment recovery', () => {
  it('cancels the previous PayMongo intent before debiting the wallet', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    const transaction = {
      id: 20,
      order: 17,
      status: 'pending',
      payment_intent_id: 'pi_existing',
      payment_method: 'gcash',
      amount: 125,
      currency: 'PHP',
    }
    const order = {
      id: 17,
      customer: { id: 2, user: { id: 42 } },
      merchant: { id: 3 },
      status: 'pending',
      fulfillment_type: 'delivery',
      total: 125,
    }
    const wallet = { id: 5, balance_minor: 20000, currency: 'PHP' }
    const fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'pi_existing', attributes: { status: 'awaiting_next_action' } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'pi_existing', attributes: { status: 'canceled' } } }),
      })
    vi.stubGlobal('fetch', fetch)

    const payload = {
      findByID: vi.fn(async ({ collection }: { collection: string }) => (
        collection === 'orders' ? order : wallet
      )),
      find: vi.fn(async ({ collection, where }: { collection: string; where: unknown }) => {
        if (collection === 'transactions') {
          return {
            docs: JSON.stringify(where).includes('"equals":"paid"') ? [] : [transaction],
          }
        }
        if (collection === 'customer-wallets') return { docs: [wallet] }
        return { docs: [] }
      }),
      update: vi.fn(async () => transaction),
      create: vi.fn(async ({ collection, data }: { collection: string; data: object }) => ({
        id: collection === 'delivery-fulfillment-outbox' ? 40 : 41,
        ...data,
      })),
      jobs: { queue: vi.fn(async () => undefined) },
      db: {
        beginTransaction: vi.fn(async () => 'wallet-payment-tx'),
        commitTransaction: vi.fn(async () => undefined),
        rollbackTransaction: vi.fn(async () => undefined),
        sessions: {
          'wallet-payment-tx': {
            db: { execute: vi.fn(async () => ({ rows: [{ id: 5 }] })) },
          },
        },
      },
    }
    const req = {
      user: { id: 42, role: 'customer' },
      json: async () => ({
        orderId: 17,
        paymentMethod: 'wallet',
        retryAttemptId: 'retry-wallet-001',
      }),
      payload,
      transactionID: undefined,
    }

    const response = await checkoutPaymentResumeHandler(req as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ state: 'paid', wallet: true })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe('https://api.paymongo.com/v1/payment_intents/pi_existing/cancel')
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: expect.objectContaining({ status: 'paid', payment_method: 'wallet' }),
    }))
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'wallet-ledger-entries',
      data: expect.objectContaining({
        source_type: 'order',
        source_id: '17',
        amount_minor: -12500,
      }),
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('wallet-payment-tx')
    expect(payload.jobs.queue).toHaveBeenCalledWith(expect.objectContaining({
      task: 'delivery-fulfillment',
    }))
  })
})

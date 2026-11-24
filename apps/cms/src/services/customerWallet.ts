import type { PayloadRequest } from 'payload'
import type { DrizzleAdapter, TransactionPg } from '@payloadcms/drizzle'
import { sql } from 'drizzle-orm'

type WalletDoc = {
  id: number | string
  balance_minor: number
  currency: string
}

export class InsufficientWalletBalanceError extends Error {
  constructor() {
    super('Your wallet balance is not enough to pay for this order.')
    this.name = 'InsufficientWalletBalanceError'
  }
}

function relationId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

async function lockRow(req: PayloadRequest, tableName: 'customer_wallets' | 'wallet_topups', id: number | string) {
  const transactionID = req.transactionID
  if (!transactionID) throw new Error('A database transaction is required for wallet balance changes.')

  const adapter = req.payload.db as unknown as DrizzleAdapter
  const session = adapter.sessions[String(await transactionID)]
  if (!session) throw new Error('Wallet database transaction is unavailable.')

  const transactionDb = session.db as TransactionPg
  await transactionDb.execute(
    sql`SELECT id FROM ${sql.raw(tableName)} WHERE id = ${id} FOR UPDATE` as never,
  )
}

export async function findOrCreateCustomerWallet(
  req: PayloadRequest,
  customerId: number,
): Promise<WalletDoc> {
  const existing = await req.payload.find({
    collection: 'customer-wallets',
    where: { customer: { equals: customerId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (existing.docs[0]) return existing.docs[0] as unknown as WalletDoc

  try {
    return await req.payload.create({
      collection: 'customer-wallets',
      data: { customer: customerId, balance_minor: 0, currency: 'PHP' } as never,
      depth: 0,
      overrideAccess: true,
      req,
    }) as unknown as WalletDoc
  } catch (error) {
    if ((error as { code?: string })?.code !== '23505') throw error
    const raced = await req.payload.find({
      collection: 'customer-wallets',
      where: { customer: { equals: customerId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (!raced.docs[0]) throw error
    return raced.docs[0] as unknown as WalletDoc
  }
}

export async function creditWalletTopup(
  req: PayloadRequest,
  topupId: number | string,
  paidAt: string,
  paymentId: string,
): Promise<void> {
  await lockRow(req, 'wallet_topups', topupId)
  const topup = await req.payload.findByID({
    collection: 'wallet-topups',
    id: topupId,
    depth: 0,
    overrideAccess: true,
    req,
  }) as unknown as {
    id: number | string
    wallet: unknown
    amount_minor: number
    currency: string
    status: string
  }
  if (!topup || String(topup.currency).toUpperCase() !== 'PHP') {
    throw new Error('Wallet top-up record is missing or has an unsupported currency.')
  }

  const walletId = relationId(topup.wallet)
  if (!walletId) throw new Error('Wallet top-up has no valid wallet.')
  const wallet = await req.payload.findByID({
    collection: 'customer-wallets',
    id: walletId,
    depth: 0,
    overrideAccess: true,
    req,
  }) as unknown as WalletDoc
  await lockRow(req, 'customer_wallets', wallet.id)
  const lockedWallet = await req.payload.findByID({
    collection: 'customer-wallets',
    id: wallet.id,
    depth: 0,
    overrideAccess: true,
    req,
  }) as unknown as WalletDoc

  const priorEntry = await req.payload.find({
    collection: 'wallet-ledger-entries',
    where: {
      and: [
        { source_type: { equals: 'wallet_topup' } },
        { source_id: { equals: String(topup.id) } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (!priorEntry.docs.length) {
    const amountMinor = Number(topup.amount_minor)
    if (!Number.isSafeInteger(amountMinor) || amountMinor < 100) {
      throw new Error('Wallet top-up amount is invalid.')
    }
    await req.payload.update({
      collection: 'customer-wallets',
      id: lockedWallet.id,
      data: { balance_minor: Number(lockedWallet.balance_minor) + amountMinor } as never,
      overrideAccess: true,
      req,
    })
    await req.payload.create({
      collection: 'wallet-ledger-entries',
      data: {
        wallet: wallet.id,
        entry_type: 'topup',
        amount_minor: amountMinor,
        currency: 'PHP',
        source_type: 'wallet_topup',
        source_id: String(topup.id),
        description: 'PayMongo wallet top-up',
      } as never,
      overrideAccess: true,
      req,
    })
  }

  if (topup.status !== 'paid') {
    await req.payload.update({
      collection: 'wallet-topups',
      id: topup.id,
      data: { status: 'paid', paid_at: paidAt, payment_id: paymentId } as never,
      overrideAccess: true,
      req,
    })
  }
}

export async function failWalletTopupIfPending(
  req: PayloadRequest,
  topupId: number | string,
): Promise<'failed' | 'paid'> {
  await lockRow(req, 'wallet_topups', topupId)
  const topup = await req.payload.findByID({
    collection: 'wallet-topups',
    id: topupId,
    depth: 0,
    overrideAccess: true,
    req,
  }) as { id: number | string; status: string }

  if (topup.status === 'paid') return 'paid'
  if (topup.status === 'pending') {
    await req.payload.update({
      collection: 'wallet-topups',
      id: topup.id,
      data: { status: 'failed' } as never,
      overrideAccess: true,
      req,
    })
  }
  return 'failed'
}

export async function debitWalletForOrder(
  req: PayloadRequest,
  customerId: number,
  orderId: number | string,
  amountMinor: number,
): Promise<void> {
  const wallet = await findOrCreateCustomerWallet(req, customerId)
  await lockRow(req, 'customer_wallets', wallet.id)

  const priorEntry = await req.payload.find({
    collection: 'wallet-ledger-entries',
    where: {
      and: [
        { source_type: { equals: 'order' } },
        { source_id: { equals: String(orderId) } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (priorEntry.docs.length) return

  const currentWallet = await req.payload.findByID({
    collection: 'customer-wallets',
    id: wallet.id,
    depth: 0,
    overrideAccess: true,
    req,
  }) as unknown as WalletDoc
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error('Order wallet debit amount is invalid.')
  }
  if (Number(currentWallet.balance_minor) < amountMinor) {
    throw new InsufficientWalletBalanceError()
  }

  await req.payload.update({
    collection: 'customer-wallets',
    id: wallet.id,
    data: { balance_minor: Number(currentWallet.balance_minor) - amountMinor } as never,
    overrideAccess: true,
    req,
  })
  await req.payload.create({
    collection: 'wallet-ledger-entries',
    data: {
      wallet: wallet.id,
      entry_type: 'order_payment',
      amount_minor: -amountMinor,
      currency: 'PHP',
      source_type: 'order',
      source_id: String(orderId),
      description: `Payment for order #${orderId}`,
    } as never,
    overrideAccess: true,
    req,
  })
}

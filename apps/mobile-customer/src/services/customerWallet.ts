import { apiConfig } from '../config/environment'
import type { BankCode, PaymentMethod } from '../utils/paymentMethods'

export type WalletEntry = {
  id: string | number
  type: string
  amountMinor: number
  currency: string
  sourceType: string
  sourceId: string
  description: string
  createdAt: string
}

export type WalletOverview = {
  balanceMinor: number
  currency: string
  entries: WalletEntry[]
}

function headers(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `JWT ${token}`,
  }
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error || `Wallet request failed (${response.status}).`)
  }
  return data
}

export async function fetchCustomerWallet(
  token: string,
  signal?: AbortSignal,
): Promise<WalletOverview> {
  const response = await fetch(`${apiConfig.baseUrl}/wallet`, {
    headers: headers(token),
    signal,
    cache: 'no-store',
  })
  const data = await readResponse(response)
  return {
    balanceMinor: Number(data.balanceMinor) || 0,
    currency: String(data.currency || 'PHP'),
    entries: Array.isArray(data.entries) ? data.entries : [],
  }
}

export async function prepareWalletTopup(args: {
  token: string
  amountMinor: number
  paymentMethod: PaymentMethod
  bankCode: BankCode | null
  idempotencyKey: string
}) {
  const response = await fetch(`${apiConfig.baseUrl}/wallet/topups/prepare`, {
    method: 'POST',
    headers: headers(args.token),
    body: JSON.stringify({
      amountMinor: args.amountMinor,
      paymentMethod: args.paymentMethod,
      ...(args.bankCode ? { bankCode: args.bankCode } : {}),
      idempotencyKey: args.idempotencyKey,
    }),
  })
  return readResponse(response) as Promise<{
    topupId: number | string
    paymentIntentId: string
    clientKey: string
    amountMinor: number
    status: string
  }>
}

export async function reconcileWalletTopup(args: {
  token: string
  topupId: string | number
}): Promise<'paid' | 'pending' | 'failed'> {
  const response = await fetch(`${apiConfig.baseUrl}/wallet/topups/reconcile`, {
    method: 'POST',
    headers: headers(args.token),
    body: JSON.stringify({ topupId: args.topupId }),
  })
  const data = await readResponse(response)
  if (data.state !== 'paid' && data.state !== 'pending' && data.state !== 'failed') {
    throw new Error('Wallet top-up status could not be verified.')
  }
  return data.state
}

export async function cancelWalletTopup(args: {
  token: string
  topupId: string | number
}): Promise<'cancelled' | 'paid' | 'processing'> {
  const response = await fetch(`${apiConfig.baseUrl}/wallet/topups/cancel`, {
    method: 'POST',
    headers: headers(args.token),
    body: JSON.stringify({ topupId: args.topupId }),
  })
  const data = await readResponse(response)
  if (data.state !== 'cancelled' && data.state !== 'paid' && data.state !== 'processing') {
    throw new Error('Wallet top-up could not be safely cancelled.')
  }
  return data.state
}


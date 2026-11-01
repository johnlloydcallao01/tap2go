function relationId(value: unknown): string | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  return raw === null || raw === undefined || raw === '' ? null : String(raw)
}

export function isOrderOwnedByCustomer(order: any, customerUserId: string | number): boolean {
  const customer = order?.customer && typeof order.customer === 'object'
    ? order.customer
    : null
  return relationId(customer?.user) === String(customerUserId)
}

export type PayMongoIntentRecoveryState =
  | 'action_required'
  | 'processing'
  | 'retryable'
  | 'terminal'
  | 'unknown'

export function classifyPayMongoIntentStatus(status: unknown): PayMongoIntentRecoveryState {
  switch (String(status || '').toLowerCase()) {
    case 'awaiting_next_action':
      return 'action_required'
    case 'succeeded':
    case 'processing':
      return 'processing'
    case 'awaiting_payment_method':
      return 'retryable'
    case 'canceled':
      return 'terminal'
    default:
      return 'unknown'
  }
}

export function isTerminalPaymentFailure(status: unknown): boolean {
  const normalized = String(status || '').toLowerCase()
  return normalized === 'awaiting_payment_method' || normalized === 'canceled'
}

export function isLatestFailedPaymentAttempt(
  latestAttempt: { id?: unknown; status?: unknown } | null | undefined,
  failedTransactionId: string | number,
): boolean {
  return String(latestAttempt?.id) === String(failedTransactionId) &&
    String(latestAttempt?.status || '').toLowerCase() === 'failed'
}

export function buildOrderPaymentSummary(orderStatus: unknown, transactions: any[]) {
  const latest = transactions[0] || null
  const isPaid = transactions.some(
    (transaction) => String(transaction?.status || '').toLowerCase() === 'paid',
  )
  const paymentStatus = isPaid
    ? 'paid'
    : String(latest?.status || 'unpaid').toLowerCase()
  return {
    isPaid,
    paymentStatus,
    paymentMethod: latest?.payment_method || null,
    canResumePayment:
      !isPaid &&
      String(orderStatus || '').toLowerCase() === 'pending' &&
      ['pending', 'failed'].includes(paymentStatus),
  }
}

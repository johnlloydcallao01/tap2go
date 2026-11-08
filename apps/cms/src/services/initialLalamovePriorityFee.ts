import type { DeliveryProvider } from './deliveryProviders/types'

type PriorityFeeProvider = Pick<DeliveryProvider, 'addPriorityFee' | 'getOrderDetails'>

function readPriorityFee(value: unknown): number {
  const fee = Number(value)
  return Number.isFinite(fee) && fee > 0 ? fee : 0
}

export async function submitInitialLalamovePriorityFee(args: {
  provider: PriorityFeeProvider
  orderId: string
  requestedFee: number
  orderStatus?: string | null
}): Promise<number> {
  const { provider, orderId, requestedFee } = args
  if (!Number.isFinite(requestedFee) || requestedFee <= 0) {
    if (requestedFee !== 0) {
      console.error(`[delivery/book] Invalid LALAMOVE_PRIORITY_FEE value: ${requestedFee}`)
    }
    return 0
  }

  const orderStatus = String(args.orderStatus || '').toUpperCase()
  if (orderStatus && orderStatus !== 'ASSIGNING_DRIVER') {
    console.warn(
      `[delivery/book] Priority fee skipped for Lalamove order ${orderId}: status is ${orderStatus}, not ASSIGNING_DRIVER.`,
    )
    return 0
  }

  let submitError: unknown
  try {
    const response = await provider.addPriorityFee(orderId, requestedFee.toFixed(2))
    const confirmedFee = readPriorityFee(response?.priceBreakdown?.priorityFee)
    if (confirmedFee > 0) {
      console.info(
        `[delivery/book] Lalamove confirmed priority fee ${confirmedFee} for order ${orderId}.`,
      )
      return confirmedFee
    }
    submitError = new Error('Lalamove priority-fee response did not include a confirmed priorityFee.')
  } catch (error) {
    submitError = error
  }

  try {
    const order = await provider.getOrderDetails(orderId)
    const confirmedFee = readPriorityFee(order?.priceBreakdown?.priorityFee)
    if (confirmedFee > 0) {
      console.warn(
        `[delivery/book] Priority fee for Lalamove order ${orderId} was confirmed by order-detail reconciliation after the add-fee response was inconclusive.`,
      )
      return confirmedFee
    }
  } catch (reconciliationError) {
    console.error(
      `[delivery/book] Could not reconcile priority fee for Lalamove order ${orderId}:`,
      reconciliationError,
    )
  }

  console.error(
    `[delivery/book] Priority fee NOT confirmed for Lalamove order ${orderId}:`,
    submitError,
  )
  return 0
}

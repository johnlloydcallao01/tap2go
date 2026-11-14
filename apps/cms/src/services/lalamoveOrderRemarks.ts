const MAX_LALAMOVE_REMARKS_LENGTH = 1500

type OrderItem = {
  product_name_snapshot?: unknown
  quantity?: unknown
  price_at_purchase?: unknown
  total_price?: unknown
  options_snapshot?: unknown
}

type OrderTotals = {
  subtotal?: unknown
  deliveryFee?: unknown
  total?: unknown
}

function amount(value: unknown): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? `PHP ${parsed.toFixed(2)}` : 'PHP N/A'
}

function quoteAmount(value: unknown): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed.toFixed(2) : String(value ?? 'N/A')
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

export class LalamoveRemarksLimitError extends Error {
  readonly code = 'LALAMOVE_REMARKS_TOO_LONG'
  readonly status = 422

  constructor(length: number) {
    super(`Complete order details require ${length} characters; Lalamove recipient remarks are limited to ${MAX_LALAMOVE_REMARKS_LENGTH}. No item details were omitted.`)
    this.name = 'LalamoveRemarksLimitError'
  }
}

export class LalamoveOrderDetailsError extends Error {
  readonly code = 'LALAMOVE_ORDER_DETAILS_INCOMPLETE'
  readonly status = 422

  constructor(message: string) {
    super(message)
    this.name = 'LalamoveOrderDetailsError'
  }
}

function formatOption(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const entry = value as Record<string, unknown>

  if (entry.entryType === 'variation') {
    const variationName = cleanText(entry.selectedVariationName) || cleanText(entry.name)
    const details = variationName ? [variationName] : []
    const attributes = Array.isArray(entry.variationAttributes)
      ? entry.variationAttributes.flatMap((attribute) => {
          if (!attribute || typeof attribute !== 'object') return []
          const item = attribute as Record<string, unknown>
          const name = cleanText(item.attributeName)
          const term = cleanText(item.termName)
          return name && term ? [`${name}: ${term}`] : []
        })
      : []
    if (attributes.length > 0) details.push(`Attributes: ${attributes.join(', ')}`)
    const sku = cleanText(entry.variationSku)
    if (sku) details.push(`SKU: ${sku}`)
    const description = cleanText(entry.variationDescription)
    if (description) details.push(`Details: ${description}`)
    if (details.length === 0) {
      throw new LalamoveOrderDetailsError('A selected variation has no saved name or attributes.')
    }
    return `Variation: ${details.join('; ')}`
  }

  if (entry.entryType === 'grouped') {
    const groupedProductName = cleanText(entry.groupedProductName) || cleanText(entry.name)
    if (!groupedProductName) {
      throw new LalamoveOrderDetailsError('A grouped-product component has no saved parent name.')
    }
    return `Grouped product: ${groupedProductName}`
  }

  const groupName = cleanText(entry.groupName)
  const optionName = cleanText(entry.optionName ?? entry.name)
  if (!optionName) {
    throw new LalamoveOrderDetailsError('A selected modifier has no saved option name.')
  }
  const price = Number(entry.price)
  const priceSuffix = Number.isFinite(price) && price !== 0 ? ` (${amount(price)})` : ''
  return `${groupName ? `${groupName}: ` : ''}${optionName}${priceSuffix}`
}

function formatItem(item: OrderItem, index: number): string {
  const name = cleanText(item.product_name_snapshot)
  if (!name) {
    throw new LalamoveOrderDetailsError(`Order item ${index + 1} has no saved product name.`)
  }
  const quantity = Number(item.quantity)
  const unitPrice = Number(item.price_at_purchase)
  const lineTotal = Number(item.total_price)
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new LalamoveOrderDetailsError(`Order item "${name}" has no valid saved quantity.`)
  }
  if (
    item.price_at_purchase === null ||
    item.price_at_purchase === undefined ||
    item.total_price === null ||
    item.total_price === undefined ||
    !Number.isFinite(unitPrice) ||
    unitPrice < 0 ||
    !Number.isFinite(lineTotal) ||
    lineTotal < 0
  ) {
    throw new LalamoveOrderDetailsError(`Order item "${name}" has invalid saved pricing.`)
  }
  const options = Array.isArray(item.options_snapshot)
    ? item.options_snapshot.map(formatOption).filter(Boolean)
    : []
  const label = [name, options.length ? `(${options.join('; ')})` : ''].filter(Boolean).join(' ')

  return `- ${label} x${quantity} @ ${amount(unitPrice)} each = ${amount(lineTotal)}`
}

function renderRemarks(
  fixedLines: string[],
  itemLines: string[],
  instructions: string,
): string {
  const lines = [...fixedLines, ...itemLines]
  if (instructions) lines.push(`RIDER INSTRUCTIONS: ${instructions}`)
  return lines.join('\r\n')
}

export function getLalamoveItemQuantity(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity)
    return total + (Number.isInteger(quantity) && quantity > 0 ? quantity : 0)
  }, 0)
}

export function buildLalamoveOrderRemarks(args: {
  orderId: number | string
  merchantName: string
  items: OrderItem[]
  totals: OrderTotals
  lalamoveQuote: { total: unknown; currency: string }
  instructions?: string
}): string {
  if (args.items.length === 0) {
    throw new LalamoveOrderDetailsError('The order has no saved item details; delivery was not booked.')
  }
  const requiredAmounts = [
    args.totals.subtotal,
    args.totals.deliveryFee,
    args.totals.total,
    args.lalamoveQuote.total,
  ]
  if (requiredAmounts.some((value) =>
    value === null ||
    value === undefined ||
    value === '' ||
    !Number.isFinite(Number(value)),
  )) {
    throw new LalamoveOrderDetailsError('The order is missing saved total amounts; delivery was not booked.')
  }

  const fixedLines = [
    `ORDER #${args.orderId}`,
    `MERCHANT: ${cleanText(args.merchantName) || 'Merchant'}`,
    'ITEMS:',
    `Items subtotal: ${amount(args.totals.subtotal)}`,
    `Checkout delivery fee: ${amount(args.totals.deliveryFee)}`,
    `TOTAL PAID AT CHECKOUT: ${amount(args.totals.total)}`,
    `Lalamove delivery quote (before any priority add-on): ${args.lalamoveQuote.currency} ${quoteAmount(args.lalamoveQuote.total)}`,
  ]
  const itemLines = args.items.map(formatItem)
  const remarks = renderRemarks(
    fixedLines,
    itemLines,
    cleanText(args.instructions),
  )
  if (remarks.length > MAX_LALAMOVE_REMARKS_LENGTH) {
    throw new LalamoveRemarksLimitError(remarks.length)
  }

  return remarks
}

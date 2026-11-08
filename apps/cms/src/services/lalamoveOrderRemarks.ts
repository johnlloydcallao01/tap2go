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

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) return value
  return `${value.slice(0, Math.max(0, limit - 3)).trimEnd()}...`
}

function formatItem(item: OrderItem, index: number): string {
  const name = cleanText(item.product_name_snapshot) || `Item ${index + 1}`
  const options = Array.isArray(item.options_snapshot)
    ? item.options_snapshot
        .map((option) => {
          if (!option || typeof option !== 'object') return ''
          const entry = option as Record<string, unknown>
          return cleanText(entry.name ?? entry.optionName ?? entry.selectedVariationName)
        })
        .filter(Boolean)
    : []
  const label = truncateText(
    [name, options.length ? `(${options.join(', ')})` : ''].filter(Boolean).join(' '),
    240,
  )
  const quantity = Number(item.quantity)
  const unitPrice = amount(item.price_at_purchase)
  const lineTotal = amount(item.total_price)

  return `- ${label} x${Number.isFinite(quantity) && quantity > 0 ? quantity : '?'} @ ${unitPrice} each = ${lineTotal}`
}

function renderRemarks(
  fixedLines: string[],
  itemLines: string[],
  omittedCount: number,
  instructions: string,
): string {
  const lines = [...fixedLines, ...itemLines]
  if (omittedCount > 0) lines.push(`... ${omittedCount} more item(s) omitted`)
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
  const fixedLines = [
    `ORDER #${args.orderId}`,
    `MERCHANT: ${truncateText(cleanText(args.merchantName) || 'Merchant', 120)}`,
    'ITEMS:',
    `Items subtotal: ${amount(args.totals.subtotal)}`,
    `Checkout delivery fee: ${amount(args.totals.deliveryFee)}`,
    `TOTAL PAID AT CHECKOUT: ${amount(args.totals.total)}`,
    `Lalamove delivery quote (before any priority add-on): ${args.lalamoveQuote.currency} ${quoteAmount(args.lalamoveQuote.total)}`,
  ]
  const itemLines = args.items.length
    ? args.items.map(formatItem)
    : ['- Item details unavailable; contact merchant']
  let omittedCount = 0
  let instructions = cleanText(args.instructions)
  let remarks = renderRemarks(fixedLines, itemLines, omittedCount, instructions)

  while (remarks.length > MAX_LALAMOVE_REMARKS_LENGTH && itemLines.length > 0) {
    itemLines.pop()
    omittedCount += 1
    remarks = renderRemarks(fixedLines, itemLines, omittedCount, instructions)
  }

  if (remarks.length > MAX_LALAMOVE_REMARKS_LENGTH) {
    const withoutInstructions = renderRemarks(fixedLines, itemLines, omittedCount, '')
    const availableLength = Math.max(0, MAX_LALAMOVE_REMARKS_LENGTH - withoutInstructions.length - 20)
    instructions = truncateText(instructions, availableLength)
    remarks = renderRemarks(fixedLines, itemLines, omittedCount, instructions)
  }

  return remarks.slice(0, MAX_LALAMOVE_REMARKS_LENGTH)
}

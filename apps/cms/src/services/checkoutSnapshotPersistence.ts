import { sql } from 'drizzle-orm'
import type { Payload } from 'payload'
import { normalizeOrderItemOptionsSnapshot } from './orderItemSnapshot'
import { validateOrderItemSnapshot } from './orderItemValidation'
import { bustOrderItemsCache, bustOrdersCache } from '../utils/dashboardCache'

type CheckoutPayload = Pick<Payload, 'db' | 'find' | 'findByID'>

type CheckoutLine = {
  cartItemId: number
  productId: number | null
  merchantProductId: number | null
  selectedVariationId: number | null
  selectedModifiers: unknown[]
  productName: string
  priceAtPurchase: number
  quantity: number
  optionsSnapshot: unknown
  totalPrice: number
}

type DeliverySnapshot = {
  formattedAddress: string
  latitude: number
  longitude: number
  street: string | null
  floorUnitRoom: string | null
  deliveryInstructions: string | null
  notes: string | null
  contactName: string
  contactPhone: string | null
  label: 'home' | 'office' | 'other'
}

type PersistenceResult = {
  rows?: Array<{
    delivery_count?: number | string
    order_item_count?: number | string
    cart_link_count?: number | string
  }>
}

export class CheckoutCartUnavailableError extends Error {
  constructor() {
    super('One or more cart items are already in another checkout. Refresh your cart and resolve any pending payment before trying again.')
    this.name = 'CheckoutCartUnavailableError'
  }
}

function relationId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  if (raw === null || raw === undefined || raw === '') return null
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function assertCheckoutCartAvailable(args: {
  payload: CheckoutPayload
  customerId: number
  merchantId: number
  cartItems: any[]
}): Promise<void> {
  if (args.cartItems.length === 0) {
    throw new Error('Checkout snapshot persistence requires at least one cart item')
  }

  const cartItemIds = args.cartItems.map((item) => relationId(item?.id))
  if (cartItemIds.some((id) => !id)) {
    throw new Error('Checkout contains an invalid cart item ID')
  }
  if (new Set(cartItemIds).size !== cartItemIds.length) {
    throw new Error('Checkout contains duplicate cart item IDs')
  }

  const result = (await args.payload.db.drizzle.execute(sql`
    SELECT count(*)::integer AS eligible_count
    FROM cart_items
    WHERE id IN (${sql.join(cartItemIds.map((id) => sql`${id}`), sql`, `)})
      AND customer_id = ${args.customerId}
      AND merchant_id = ${args.merchantId}
      AND status = 'active'
      AND order_id_id IS NULL
  ` as never)) as unknown as { rows?: Array<{ eligible_count?: number | string }> }

  if (Number(result.rows?.[0]?.eligible_count ?? 0) !== cartItemIds.length) {
    throw new CheckoutCartUnavailableError()
  }
}

export async function findLinkedPendingOrder(args: {
  payload: CheckoutPayload
  customerId: number
  merchantId: number
  cartItems: any[]
}): Promise<number | null> {
  const cartItemIds = args.cartItems.map((item) => relationId(item?.id))
  if (
    cartItemIds.length === 0 ||
    cartItemIds.some((id) => !id) ||
    new Set(cartItemIds).size !== cartItemIds.length
  ) {
    return null
  }

  const result = await args.payload.find({
    collection: 'cart-items',
    where: {
      and: [
        { id: { in: cartItemIds as number[] } },
        { customer: { equals: args.customerId } },
        { merchant: { equals: args.merchantId } },
        { status: { in: ['active', 'checked_out'] } },
        { order_id: { exists: true } },
      ],
    },
    depth: 0,
    limit: cartItemIds.length + 1,
    overrideAccess: true,
  })

  if (result.docs.length !== cartItemIds.length) return null
  const linkedOrderIds = result.docs.map((item: any) => relationId(item.order_id))
  if (linkedOrderIds.some((id) => !id) || new Set(linkedOrderIds).size !== 1) return null

  const orderId = Number(linkedOrderIds[0])
  const order = await args.payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 0,
    overrideAccess: true,
  }) as any
  if (
    !order ||
    String(relationId(order.customer)) !== String(args.customerId) ||
    String(relationId(order.merchant)) !== String(args.merchantId) ||
    String(order.status).toLowerCase() !== 'pending'
  ) {
    return null
  }

  const linkedItems = await args.payload.find({
    collection: 'cart-items',
    where: {
      and: [
        { customer: { equals: args.customerId } },
        { merchant: { equals: args.merchantId } },
        { status: { in: ['active', 'checked_out'] } },
        { order_id: { equals: orderId } },
      ],
    },
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })
  if (
    linkedItems.docs.length !== cartItemIds.length ||
    new Set(linkedItems.docs.map((item: any) => relationId(item.id))).size !== cartItemIds.length ||
    cartItemIds.some((id) => !linkedItems.docs.some((item: any) => relationId(item.id) === id))
  ) {
    return null
  }

  const transactions = await args.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { order: { equals: orderId } },
        { status: { in: ['pending', 'failed'] } },
      ],
    },
    sort: '-id',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return transactions.docs.length > 0 ? orderId : null
}

export async function persistCheckoutSnapshots(args: {
  payload: CheckoutPayload
  requestId: string
  orderId: number
  customerId: number
  merchantId: number
  cartItems: any[]
  delivery: DeliverySnapshot
}): Promise<{ validationMs: number; writeMs: number }> {
  if (args.cartItems.length === 0) {
    throw new Error('Checkout snapshot persistence requires at least one cart item')
  }

  const lines: CheckoutLine[] = args.cartItems.map((item) => {
    const cartItemId = relationId(item?.id)
    if (!cartItemId) throw new Error('Checkout contains an invalid cart item ID')
    const productId = relationId(item?.product)
    const merchantProductId = relationId(item?.merchantProduct)
    const selectedVariationId = relationId(item?.selectedVariation)
    if (
      (item?.product != null && !productId) ||
      (item?.merchantProduct != null && !merchantProductId) ||
      (item?.selectedVariation != null && !selectedVariationId)
    ) {
      throw new Error('Checkout contains an invalid product reference')
    }
    const selectedModifiers = Array.isArray(item?.selectedModifiers) ? item.selectedModifiers : []
    return {
      cartItemId,
      productId,
      merchantProductId,
      selectedVariationId,
      selectedModifiers,
      productName: String(item?.productName || 'Item'),
      priceAtPurchase: Number(item?.priceAtAdd) || 0,
      quantity: Number(item?.quantity) || 1,
      optionsSnapshot: [
        ...(selectedVariationId
          ? [{
              entryType: 'variation',
              name: item?.selectedVariationName || `Variation #${selectedVariationId}`,
              selectedVariationId,
              selectedVariationName: item?.selectedVariationName || undefined,
              price: 0,
            }]
          : []),
        ...selectedModifiers.map((modifier: any) => ({
          entryType: 'modifier',
          sourceType: modifier?.source,
          groupId: modifier?.groupId,
          groupName: modifier?.groupName,
          optionId: modifier?.optionId,
          optionName: modifier?.name,
          selectedVariationId: selectedVariationId || undefined,
          selectedVariationName: item?.selectedVariationName || undefined,
          name: modifier?.name || 'Modifier',
          price: typeof modifier?.price === 'number' ? modifier.price : 0,
        })),
      ],
      totalPrice: Number(item?.subtotal) || 0,
    }
  })

  if (new Set(lines.map((line) => line.cartItemId)).size !== lines.length) {
    throw new Error('Checkout contains duplicate cart item IDs')
  }

  const validationStartedAt = Date.now()
  await Promise.all(lines.map(async (line) => {
    await validateOrderItemSnapshot({
      payload: args.payload as Payload,
      productId: line.productId,
      merchantProductId: line.merchantProductId,
      optionsSnapshot: line.optionsSnapshot,
      requireStructuredEntries: true,
    })
    line.optionsSnapshot = normalizeOrderItemOptionsSnapshot(line.optionsSnapshot)
  }))
  const validationMs = Date.now() - validationStartedAt

  const writeStartedAt = Date.now()
  const databaseLines = lines.map((line) => ({
    cart_item_id: line.cartItemId,
    product_id: line.productId,
    merchant_product_id: line.merchantProductId,
    selected_variation_id: line.selectedVariationId,
    selected_modifiers: line.selectedModifiers,
    product_name: line.productName,
    price_at_purchase: line.priceAtPurchase,
    quantity: line.quantity,
    options_snapshot: line.optionsSnapshot,
    total_price: line.totalPrice,
  }))
  const result = (await args.payload.db.drizzle.execute(sql`
    WITH input_lines AS MATERIALIZED (
      SELECT *
      FROM jsonb_to_recordset(${JSON.stringify(databaseLines)}::jsonb) AS line(
        cart_item_id integer,
        product_id integer,
        merchant_product_id integer,
        selected_variation_id integer,
        selected_modifiers jsonb,
        product_name text,
        price_at_purchase numeric,
        quantity numeric,
        options_snapshot jsonb,
        total_price numeric
      )
    ),
    requested_cart_items AS MATERIALIZED (
      SELECT cart_item_id AS id FROM input_lines
    ),
    eligible_cart_items AS MATERIALIZED (
      SELECT cart.id
      FROM cart_items AS cart
      INNER JOIN requested_cart_items AS requested ON requested.id = cart.id
      INNER JOIN input_lines AS line ON line.cart_item_id = cart.id
      WHERE cart.customer_id = ${args.customerId}
        AND cart.merchant_id = ${args.merchantId}
        AND cart.status = 'active'
        AND cart.order_id_id IS NULL
        AND cart.product_id IS NOT DISTINCT FROM line.product_id
        AND cart.merchant_product_id IS NOT DISTINCT FROM line.merchant_product_id
        AND cart.selected_variation_id IS NOT DISTINCT FROM line.selected_variation_id
        AND COALESCE(cart.selected_modifiers, '[]'::jsonb) = COALESCE(line.selected_modifiers, '[]'::jsonb)
        AND cart.quantity::numeric = line.quantity
        AND cart.price_at_add::numeric = line.price_at_purchase
        AND cart.subtotal::numeric = line.total_price
      ORDER BY cart.id
      FOR UPDATE OF cart
    ),
    delivery_insert AS (
      INSERT INTO delivery_locations (
        order_id,
        formatted_address,
        coordinates,
        street,
        floor_unit_room,
        delivery_instructions,
        notes,
        contact_name,
        contact_phone,
        label,
        updated_at,
        created_at
      )
      SELECT
        ${args.orderId},
        ${args.delivery.formattedAddress},
        ${JSON.stringify({ lat: args.delivery.latitude, lng: args.delivery.longitude })}::jsonb,
        ${args.delivery.street},
        ${args.delivery.floorUnitRoom},
        ${args.delivery.deliveryInstructions},
        ${args.delivery.notes},
        ${args.delivery.contactName},
        ${args.delivery.contactPhone},
        ${args.delivery.label},
        NOW(),
        NOW()
      WHERE (SELECT count(*) FROM eligible_cart_items) = (SELECT count(*) FROM requested_cart_items)
      RETURNING id
    ),
    order_item_insert AS (
      INSERT INTO order_items (
        order_id,
        product_id,
        merchant_product_id,
        product_name_snapshot,
        price_at_purchase,
        quantity,
        options_snapshot,
        total_price,
        updated_at,
        created_at
      )
      SELECT
        ${args.orderId},
        line.product_id,
        line.merchant_product_id,
        line.product_name,
        line.price_at_purchase,
        line.quantity,
        line.options_snapshot,
        line.total_price,
        NOW(),
        NOW()
      FROM input_lines AS line
      WHERE (SELECT count(*) FROM eligible_cart_items) = (SELECT count(*) FROM requested_cart_items)
      RETURNING id
    ),
    cart_item_link AS (
      UPDATE cart_items AS cart
      SET order_id_id = ${args.orderId},
          status = 'checked_out',
          updated_at = NOW()
      FROM eligible_cart_items AS eligible
      WHERE cart.id = eligible.id
        AND (SELECT count(*) FROM eligible_cart_items) = (SELECT count(*) FROM requested_cart_items)
      RETURNING cart.id
    )
    SELECT
      (SELECT count(*) FROM delivery_insert)::integer AS delivery_count,
      (SELECT count(*) FROM order_item_insert)::integer AS order_item_count,
      (SELECT count(*) FROM cart_item_link)::integer AS cart_link_count
  ` as never)) as unknown as PersistenceResult
  const writeMs = Date.now() - writeStartedAt
  const counts = result.rows?.[0]
  if (
    Number(counts?.delivery_count ?? 0) !== 1 ||
    Number(counts?.order_item_count ?? 0) !== lines.length ||
    Number(counts?.cart_link_count ?? 0) !== lines.length
  ) {
    throw new Error('Cart changed during checkout. Refresh your cart and try again.')
  }

  void Promise.all([
    bustOrderItemsCache(),
    bustOrdersCache(),
  ]).catch((error) => {
    console.error(`[checkout/prepare] order item cache invalidation failed [${args.requestId}]:`, error)
  })

  return { validationMs, writeMs }
}

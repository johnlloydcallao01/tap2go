import type { Payload } from 'payload'
import { ModifierResolverService, type EffectiveModifierGroup } from './ModifierResolverService'
import { extractRelationshipId } from './modifierUtils'

export type PricedCheckoutLine = {
  cartItemId: number
  productId: number
  merchantProductId: number
  quantity: number
  productName: string
  unitPrice: number
  totalPrice: number
  optionsSnapshot: Array<Record<string, unknown>>
}

export class CheckoutValidationError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 422,
  ) {
    super(message)
  }
}

function relationId(value: unknown): number | null {
  return extractRelationshipId(value as never)
}

function money(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : null
}

function selectedModifiers(
  raw: unknown,
  groups: EffectiveModifierGroup[],
  context: string,
): Array<Record<string, unknown>> {
  if (raw != null && !Array.isArray(raw)) {
    throw new CheckoutValidationError(`Cart item ${context} has invalid modifier data. Please edit it in your cart.`, 'INVALID_MODIFIERS')
  }

  const selections = (Array.isArray(raw) ? raw : []) as Array<Record<string, unknown>>
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const counts = new Map<number, number>()
  const seen = new Set<string>()
  const snapshot: Array<Record<string, unknown>> = []

  for (const selection of selections) {
    const groupId = relationId(selection.groupId ?? selection.group_id)
    const optionId = relationId(selection.optionId ?? selection.option_id)
    const group = groupId ? groupsById.get(groupId) : undefined
    const option = group?.options.find((candidate) => candidate.id === optionId)
    if (!group || !option || !option.isAvailable || !optionId) {
      throw new CheckoutValidationError(`A selected modifier is no longer available for ${context}. Please update your cart.`, 'MODIFIER_UNAVAILABLE')
    }

    const key = `${groupId}:${optionId}`
    if (seen.has(key)) {
      throw new CheckoutValidationError(`A modifier was selected more than once for ${context}. Please update your cart.`, 'INVALID_MODIFIERS')
    }
    seen.add(key)
    counts.set(groupId!, (counts.get(groupId!) ?? 0) + 1)
    snapshot.push({
      entryType: 'modifier',
      sourceType: option.source,
      groupId,
      groupName: group.name,
      optionId,
      optionName: option.name,
      name: option.name,
      price: option.priceAdjustment,
    })
  }

  for (const group of groups) {
    const count = counts.get(group.id) ?? 0
    const minimum = group.isRequired ? Math.max(1, group.minSelections) : 0
    if (
      (group.selectionType === 'single' && count > 1) ||
      count < minimum ||
      (group.maxSelections !== null && count > group.maxSelections)
    ) {
      throw new CheckoutValidationError(`Modifier selection for "${group.name}" is no longer valid. Please update your cart.`, 'INVALID_MODIFIERS')
    }
  }

  return snapshot
}

export async function priceCheckoutCart(args: {
  payload: Payload
  customerId: number
  merchantId: number
  cartItemIds: number[]
}): Promise<{ lines: PricedCheckoutLine[]; subtotal: number; cartItems: any[] }> {
  const { payload, customerId, merchantId, cartItemIds } = args
  const cartResult = await payload.find({
    collection: 'cart-items',
    where: {
      and: [
        { id: { in: cartItemIds } },
        { customer: { equals: customerId } },
        { merchant: { equals: merchantId } },
        { status: { equals: 'active' } },
      ],
    },
    limit: cartItemIds.length,
    depth: 0,
    overrideAccess: true,
  })

  if (cartResult.docs.length !== cartItemIds.length) {
    throw new CheckoutValidationError('Your cart changed or contains items you cannot check out. Refresh your cart and try again.', 'CART_CHANGED', 409)
  }

  const merchant = await payload.findByID({
    collection: 'merchants',
    id: merchantId,
    depth: 0,
    overrideAccess: true,
  })
  if (!merchant || merchant.isActive === false || merchant.isAcceptingOrders === false) {
    throw new CheckoutValidationError('This merchant is not currently accepting orders.', 'MERCHANT_UNAVAILABLE', 409)
  }

  const productsById = new Map<number, Promise<any>>()
  const merchantProductsById = new Map<number, Promise<any>>()
  const variationsById = new Map<number, Promise<any>>()
  const catalog = await Promise.all(cartResult.docs.map(async (cartItem) => {
    const productId = relationId(cartItem.product)
    const merchantProductId = relationId(cartItem.merchantProduct)
    const quantity = Number(cartItem.quantity)
    if (!productId || !merchantProductId || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      throw new CheckoutValidationError('A cart item is invalid. Refresh your cart and try again.', 'INVALID_CART_ITEM')
    }

    const selectedAddons = cartItem.selectedAddons
    if (
      selectedAddons !== null &&
      selectedAddons !== undefined &&
      !(Array.isArray(selectedAddons) && selectedAddons.length === 0)
    ) {
      throw new CheckoutValidationError(
        'Some cart items use add-ons that are not backed by a server-managed catalog. Remove those add-ons or contact support before checkout.',
        'UNSUPPORTED_CLIENT_PRICED_ADDONS',
      )
    }

    let productPromise = productsById.get(productId)
    if (!productPromise) {
      productPromise = payload.findByID({ collection: 'products', id: productId, depth: 0, overrideAccess: true })
      productsById.set(productId, productPromise)
    }
    let merchantProductPromise = merchantProductsById.get(merchantProductId)
    if (!merchantProductPromise) {
      merchantProductPromise = payload.findByID({
        collection: 'merchant-products',
        id: merchantProductId,
        depth: 0,
        overrideAccess: true,
      })
      merchantProductsById.set(merchantProductId, merchantProductPromise)
    }
    const [product, merchantProduct] = await Promise.all([productPromise, merchantProductPromise])
    if (
      relationId(merchantProduct.product_id) !== productId ||
      relationId(merchantProduct.merchant_id) !== merchantId
    ) {
      throw new CheckoutValidationError('A cart item no longer belongs to this merchant. Refresh your cart.', 'CART_CHANGED', 409)
    }
    if (product.isActive === false || merchantProduct.is_active === false || merchantProduct.is_available === false || cartItem.isAvailable === false) {
      throw new CheckoutValidationError(`${product.name || 'A product'} is no longer available. Remove it from your cart.`, 'PRODUCT_UNAVAILABLE', 409)
    }

    const selectedVariationId = relationId(cartItem.selectedVariation)
    let variation: any = null
    if (product.productType === 'variable') {
      if (!selectedVariationId) {
        throw new CheckoutValidationError(`${product.name} needs a variation selection. Update it in your cart.`, 'VARIATION_REQUIRED')
      }
      let variationPromise = variationsById.get(selectedVariationId)
      if (!variationPromise) {
        variationPromise = payload.findByID({
          collection: 'prod-variations',
          id: selectedVariationId,
          depth: 0,
          overrideAccess: true,
        })
        variationsById.set(selectedVariationId, variationPromise)
      }
      variation = await variationPromise
      if (relationId(variation.product_id) !== productId || variation.is_visible === false) {
        throw new CheckoutValidationError(`${product.name} has an invalid or unavailable variation. Update your cart.`, 'INVALID_VARIATION')
      }
      if (Number.isFinite(Number(variation.stock_quantity)) && Number(variation.stock_quantity) < quantity) {
        throw new CheckoutValidationError(`${product.name} does not have enough stock for this quantity.`, 'INSUFFICIENT_STOCK', 409)
      }
    } else if (selectedVariationId) {
      throw new CheckoutValidationError(`${product.name} no longer supports the selected variation. Update your cart.`, 'INVALID_VARIATION')
    }

    const stock = Number(merchantProduct.stock_quantity)
    if (Number.isFinite(stock) && stock >= 0 && stock < quantity) {
      throw new CheckoutValidationError(`${product.name} does not have enough stock for this quantity.`, 'INSUFFICIENT_STOCK', 409)
    }

    const basePrice =
      money(merchantProduct.price_override) ??
      money(variation?.base_price) ??
      money(product.basePrice)
    if (basePrice === null) {
      throw new CheckoutValidationError(`${product.name} does not have a valid catalog price. Contact support.`, 'INVALID_CATALOG_PRICE')
    }

    return {
      cartItem,
      product,
      productId,
      merchantProductId,
      quantity,
      selectedVariationId,
      basePrice,
      variation,
    }
  }))

  const modifierGroupsByContext = new Map<string, Promise<EffectiveModifierGroup[]>>()
  const resolver = new ModifierResolverService(payload)
  const lines = await Promise.all(catalog.map(async (entry): Promise<PricedCheckoutLine> => {
    const contextKey = `${entry.productId}:${entry.selectedVariationId ?? ''}:${entry.merchantProductId}`
    let groupsPromise = modifierGroupsByContext.get(contextKey)
    if (!groupsPromise) {
      groupsPromise = resolver.resolveEffectiveGroups({
        productId: entry.productId,
        variationId: entry.selectedVariationId,
        merchantProductId: entry.merchantProductId,
      })
      modifierGroupsByContext.set(contextKey, groupsPromise)
    }
    const groups = await groupsPromise
    const modifiers = selectedModifiers(entry.cartItem.selectedModifiers, groups, String(entry.cartItem.id))
    const modifierTotal = modifiers.reduce((sum, option) => sum + Number(option.price || 0), 0)
    const unitPrice = Math.round((entry.basePrice + modifierTotal) * 100) / 100
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new CheckoutValidationError(`${entry.product.name} has an invalid catalog price. Contact support.`, 'INVALID_CATALOG_PRICE')
    }
    const totalPrice = Math.round(unitPrice * entry.quantity * 100) / 100
    const optionsSnapshot = entry.selectedVariationId
      ? [{
          entryType: 'variation',
          name: String(entry.variation?.name || `Variation #${entry.selectedVariationId}`),
          selectedVariationId: entry.selectedVariationId,
          selectedVariationName: entry.variation?.name || undefined,
          price: 0,
        }, ...modifiers]
      : modifiers

    return {
      cartItemId: Number(entry.cartItem.id),
      productId: entry.productId,
      merchantProductId: entry.merchantProductId,
      quantity: entry.quantity,
      productName: String(entry.product.name),
      unitPrice,
      totalPrice,
      optionsSnapshot,
    }
  }))

  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.totalPrice, 0) * 100) / 100
  return { lines, subtotal, cartItems: cartResult.docs }
}

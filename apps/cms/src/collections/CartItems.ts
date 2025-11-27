import type { CollectionConfig } from 'payload'
import { createHash } from 'crypto'

export const CartItems: CollectionConfig = {
    slug: 'cart-items',
    admin: {
        useAsTitle: 'id',
        defaultColumns: ['customer', 'merchant', 'product', 'quantity', 'updatedAt'],
        group: 'Food Delivery',
        description: 'Customer shopping cart items'
    },
    access: {
        read: ({ req: { user } }) => {
            if (user) {
                if (user.role === 'service' || user.role === 'admin') {
                    return true
                }
            }
            return false
        },
        create: ({ req: { user } }) => {
            return user?.role === 'service' || user?.role === 'admin' || false
        },
        update: ({ req: { user } }) => {
            return user?.role === 'service' || user?.role === 'admin' || false
        },
        delete: ({ req: { user } }) => {
            return user?.role === 'service' || user?.role === 'admin' || false
        },
    },
    fields: [
        // === RELATIONSHIPS ===
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'customers',
            required: true,
            admin: {
                description: 'Customer who owns this cart item'
            }
        },
        {
            name: 'merchant',
            type: 'relationship',
            relationTo: 'merchants',
            required: true,
            admin: {
                description: 'Merchant from which product is being ordered'
            }
        },
        {
            name: 'product',
            type: 'relationship',
            relationTo: 'products',
            required: true,
            admin: {
                description: 'Product being added to cart'
            }
        },
        {
            name: 'merchantProduct',
            type: 'relationship',
            relationTo: 'merchant-products',
            required: true,
            admin: {
                description: 'Merchant-product junction record for price and availability'
            }
        },

        // === QUANTITY & PRICING ===
        {
            name: 'quantity',
            type: 'number',
            required: true,
            min: 1,
            max: 999,
            defaultValue: 1,
            admin: {
                description: 'Quantity of this product'
            }
        },
        {
            name: 'priceAtAdd',
            type: 'number',
            required: true,
            min: 0,
            admin: {
                description: 'Price snapshot when added to cart (from merchant-products or product basePrice)',
                step: 0.01
            }
        },
        {
            name: 'compareAtPrice',
            type: 'number',
            min: 0,
            admin: {
                description: 'Original price before discount. Shows strike-through price in UI when item is on sale. E.g., ₱150 (crossed out) → ₱120',
                step: 0.01
            }
        },
        {
            name: 'subtotal',
            type: 'number',
            required: true,
            min: 0,
            admin: {
                description: 'Calculated: (priceAtAdd + modifier costs + addon costs) * quantity',
                readOnly: true,
                step: 0.01
            }
        },

        // === PRODUCT CUSTOMIZATION ===
        {
            name: 'productSize',
            type: 'select',
            options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Extra Large', value: 'extra_large' }
            ],
            admin: {
                description: 'Product size variant if applicable'
            }
        },
        {
            name: 'selectedVariation',
            type: 'relationship',
            relationTo: 'products',
            admin: {
                description: 'Selected product variation (if product type is variable)'
            }
        },
        {
            name: 'selectedModifiers',
            type: 'json',
            admin: {
                description: 'Modifiers/options: [{ groupId, optionId, name, price }]. E.g., spice level, cooking preference'
            }
        },
        {
            name: 'selectedAddons',
            type: 'json',
            admin: {
                description: 'Add-ons/extras: [{ id, name, price, quantity }]. E.g., extra cheese, drinks, sides'
            }
        },

        // === INSTRUCTIONS ===
        {
            name: 'specialInstructions',
            type: 'textarea',
            maxLength: 500,
            admin: {
                description: 'Cooking/preparation instructions. E.g., "No onions", "Extra spicy", "Well done"'
            }
        },
        {
            name: 'notesForRider',
            type: 'textarea',
            maxLength: 300,
            admin: {
                description: 'Delivery instructions for rider. E.g., "Ring doorbell twice", "Leave at gate"'
            }
        },

        // === DUPLICATE DETECTION ===
        {
            name: 'itemHash',
            type: 'text',
            admin: {
                description: 'MD5 hash of product+size+modifiers+addons+variation+instructions for duplicate detection',
                readOnly: true
            }
        },

        // === AVAILABILITY STATUS ===
        {
            name: 'isAvailable',
            type: 'checkbox',
            defaultValue: true,
            admin: {
                description: 'Whether item is currently available (merchant-product availability, NOT price changes)'
            }
        },
        {
            name: 'unavailableReason',
            type: 'text',
            admin: {
                description: 'Reason if unavailable. E.g., "Out of stock", "Merchant closed"'
            }
        },

        // === EXPIRATION & CLEANUP ===
        {
            name: 'expiresAt',
            type: 'date',
            admin: {
                description: 'Cart item expiration date (30 days from last update). For automated cleanup jobs.',
                readOnly: true
            }
        },

        // === SESSION (FOR FUTURE) ===
        {
            name: 'sessionId',
            type: 'text',
            admin: {
                description: 'Session identifier for guest checkout (future feature)'
            }
        },
    ],

    indexes: [
        {
            fields: ['customer', 'merchant']
        },
        {
            fields: ['customer', 'itemHash']
        },
        {
            fields: ['itemHash'] // Faster hash lookups during duplicate check
        },
        {
            fields: ['updatedAt']
        },
        {
            fields: ['expiresAt'] // For cleanup jobs
        }
    ],

    timestamps: true,

    hooks: {
        beforeChange: [
            async ({ data, operation, req }) => {
                // === VALIDATION: Quantity ===
                if (data.quantity !== undefined) {
                    if (data.quantity < 1 || data.quantity > 999) {
                        throw new Error('Quantity must be between 1 and 999')
                    }
                }

                // === VALIDATION: Price ===
                if (data.priceAtAdd !== undefined && data.priceAtAdd < 0) {
                    throw new Error('Price cannot be negative')
                }

                // === AUTO-UPDATE: Expiration Date ===
                const expiryDate = new Date()
                expiryDate.setDate(expiryDate.getDate() + 30) // 30 days from now
                data.expiresAt = expiryDate

                // === GENERATE: Item Hash (MD5) ===
                const hashComponents = {
                    product: data.product,
                    merchantProduct: data.merchantProduct,
                    productSize: data.productSize || null,
                    selectedModifiers: data.selectedModifiers || [],
                    selectedAddons: data.selectedAddons || [],
                    selectedVariation: data.selectedVariation || null,
                    specialInstructions: (data.specialInstructions || '').trim().toLowerCase()
                }

                // Sort keys for deterministic hashing
                const hashString = JSON.stringify(hashComponents, Object.keys(hashComponents).sort())
                data.itemHash = createHash('md5').update(hashString).digest('hex')

                // === DUPLICATE CHECK: Merge if identical customization ===
                if (operation === 'create') {
                    const existingItem = await req.payload.find({
                        collection: 'cart-items',
                        where: {
                            and: [
                                { customer: { equals: data.customer } },
                                { merchant: { equals: data.merchant } },
                                { itemHash: { equals: data.itemHash } }
                            ]
                        },
                        limit: 1
                    })

                    if (existingItem.docs.length > 0) {
                        const existing = existingItem.docs[0]
                        await req.payload.update({
                            collection: 'cart-items',
                            id: existing.id,
                            data: {
                                quantity: existing.quantity + data.quantity
                            }
                        })
                        // Throw special error that API can catch
                        throw new Error(`CART_ITEM_MERGED:${existing.id}`)
                    }
                }

                // === CALCULATE: Subtotal ===
                if (data.priceAtAdd && data.quantity) {
                    let modifierTotal = 0
                    let addonTotal = 0

                    if (data.selectedModifiers && Array.isArray(data.selectedModifiers)) {
                        modifierTotal = data.selectedModifiers.reduce((sum, mod) => sum + (mod.price || 0), 0)
                    }

                    if (data.selectedAddons && Array.isArray(data.selectedAddons)) {
                        addonTotal = data.selectedAddons.reduce((sum, addon) => {
                            return sum + ((addon.price || 0) * (addon.quantity || 1))
                        }, 0)
                    }

                    data.subtotal = (data.priceAtAdd + modifierTotal + addonTotal) * data.quantity
                }

                // === VALIDATE: Merchant-Vendor Relationship ===
                if (operation === 'create' && data.merchant && data.product) {
                    const merchant = await req.payload.findByID({
                        collection: 'merchants',
                        id: data.merchant,
                        depth: 1
                    })

                    const product = await req.payload.findByID({
                        collection: 'products',
                        id: data.product,
                        depth: 0
                    })

                    const merchantVendorId = typeof merchant.vendor === 'object' ? merchant.vendor.id : merchant.vendor

                    if (merchantVendorId !== product.createdByVendor) {
                        throw new Error(
                            `Cannot add product "${product.name}" (vendor ${product.createdByVendor}) ` +
                            `to cart for merchant "${merchant.outletName}" (vendor ${merchantVendorId}). ` +
                            `Product must belong to merchant's vendor.`
                        )
                    }
                }

                return data
            }
        ],

        beforeDelete: [
            async ({ req: _req, id }) => {
                console.log(`🗑️ Removing cart item ${id}`)
            }
        ]
    }
}

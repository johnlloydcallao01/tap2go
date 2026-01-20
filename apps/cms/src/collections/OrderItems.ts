import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
  slug: 'order-items',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['order', 'product_name_snapshot', 'quantity', 'total_price'],
    group: 'Ordering System',
    description: 'Links products to an order with Snapshot Pricing',
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
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      admin: {
        description: 'Parent order',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: {
        description: 'Reference to the base product (for analytics)',
      },
    },
    {
      name: 'merchant_product',
      type: 'relationship',
      relationTo: 'merchant-products',
      required: true,
      admin: {
        description: 'Reference to the specific merchant listing',
      },
    },
    {
      name: 'product_name_snapshot',
      type: 'text',
      required: true,
      admin: {
        description: 'SNAPSHOT: Name of product at time of purchase',
      },
    },
    {
      name: 'price_at_purchase',
      type: 'number',
      required: true,
      admin: {
        description: 'SNAPSHOT: The price/unit paid (overrides current catalog price)',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      admin: {
        description: 'Count of items',
      },
    },
    {
      name: 'options_snapshot',
      type: 'json',
      admin: {
        description: 'SNAPSHOT: Selected modifiers and their specific prices',
      },
    },
    {
      name: 'total_price',
      type: 'number',
      required: true,
      admin: {
        description: 'price_at_purchase * quantity + modifiers',
      },
    },
  ],
}

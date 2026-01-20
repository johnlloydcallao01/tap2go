import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'status', 'total', 'placed_at'],
    group: 'Ordering System',
    description: 'Central entity for all transactions',
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
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'The customer placing the order',
      },
    },
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      required: true,
      admin: {
        description: 'The merchant fulfilling the order',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Ready for Pickup', value: 'ready_for_pickup' },
        { label: 'On Delivery', value: 'on_delivery' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'fulfillment_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Delivery', value: 'delivery' },
        { label: 'Pickup', value: 'pickup' },
      ],
      admin: {
        description: 'Critical for logistics logic',
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      admin: {
        description: 'Grand total (Subtotal + Fees - Discounts)',
      },
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      admin: {
        description: 'Sum of item prices',
      },
    },
    {
      name: 'delivery_fee',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Calculated delivery fee (0 for Pickup)',
      },
    },
    {
      name: 'platform_fee',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Service charge/App fee',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Special instructions for the merchant',
      },
    },
    {
      name: 'placed_at',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Timestamp when order was confirmed',
      },
    },
  ],
}

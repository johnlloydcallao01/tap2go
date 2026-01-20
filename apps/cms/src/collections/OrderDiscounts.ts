import type { CollectionConfig } from 'payload'

export const OrderDiscounts: CollectionConfig = {
  slug: 'order-discounts',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['order', 'code', 'amount_off', 'type'],
    group: 'Ordering System',
    description: 'Records which promo was used',
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
        description: 'Link to order',
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      admin: {
        description: 'The code used (e.g., WELCOME100)',
      },
    },
    {
      name: 'amount_off',
      type: 'number',
      required: true,
      admin: {
        description: 'Total value deducted',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' },
      ],
      required: true,
      admin: {
        description: 'percentage or fixed',
      },
    },
    // Future: Link to master voucher table
    // {
    //   name: 'source_voucher',
    //   type: 'relationship',
    //   relationTo: 'vouchers',
    //   admin: {
    //     description: '(Future) Link to master voucher table',
    //   },
    // },
  ],
}

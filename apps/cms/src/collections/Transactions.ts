import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'payment_intent_id',
    defaultColumns: ['order', 'payment_intent_id', 'amount', 'status', 'paid_at'],
    group: 'Ordering System',
    description: 'Records the financial exchange',
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
      name: 'payment_intent_id',
      type: 'text',
      admin: {
        description: 'External ID (e.g., PayMongo pi_...)',
      },
    },
    {
      name: 'payment_method',
      type: 'text',
      admin: {
        description: 'e.g., card, gcash, grab_pay',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Amount charged',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'PHP',
      admin: {
        description: 'Default PHP',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      required: true,
      defaultValue: 'pending',
    },
    {
      name: 'paid_at',
      type: 'date',
      admin: {
        description: 'Timestamp of successful payment',
      },
    },
  ],
}

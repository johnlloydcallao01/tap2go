import type { CollectionConfig } from 'payload'

export const WalletTopups: CollectionConfig = {
  slug: 'wallet-topups',
  admin: {
    useAsTitle: 'payment_intent_id',
    defaultColumns: ['customer', 'amount_minor', 'status', 'payment_intent_id', 'createdAt'],
    group: 'Ordering System',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'service',
    update: ({ req: { user } }) => user?.role === 'service',
    delete: () => false,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'wallet',
      type: 'relationship',
      relationTo: 'customer-wallets',
      required: true,
    },
    {
      name: 'amount_minor',
      type: 'number',
      required: true,
      min: 100,
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'PHP',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'idempotency_key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'payment_intent_id',
      type: 'text',
      unique: true,
    },
    {
      name: 'payment_id',
      type: 'text',
    },
    {
      name: 'payment_method',
      type: 'text',
    },
    {
      name: 'paid_at',
      type: 'date',
    },
  ],
  indexes: [
    { fields: ['customer', 'createdAt'] },
    { fields: ['status', 'createdAt'] },
  ],
}

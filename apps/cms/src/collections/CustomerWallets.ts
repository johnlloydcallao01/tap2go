import type { CollectionConfig } from 'payload'

export const CustomerWallets: CollectionConfig = {
  slug: 'customer-wallets',
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'balance_minor', 'currency', 'updatedAt'],
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
      unique: true,
    },
    {
      name: 'balance_minor',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: { description: 'Cached PHP balance in centavos. The immutable ledger is the audit trail.' },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'PHP',
    },
  ],
}

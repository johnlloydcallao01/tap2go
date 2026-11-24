import type { CollectionConfig } from 'payload'

export const WalletLedgerEntries: CollectionConfig = {
  slug: 'wallet-ledger-entries',
  admin: {
    useAsTitle: 'source_id',
    defaultColumns: ['wallet', 'entry_type', 'amount_minor', 'source_type', 'source_id', 'createdAt'],
    group: 'Ordering System',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'service',
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'wallet',
      type: 'relationship',
      relationTo: 'customer-wallets',
      required: true,
    },
    {
      name: 'entry_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Top-up', value: 'topup' },
        { label: 'Order payment', value: 'order_payment' },
        { label: 'Refund', value: 'refund' },
        { label: 'Adjustment', value: 'adjustment' },
      ],
    },
    {
      name: 'amount_minor',
      type: 'number',
      required: true,
      admin: { description: 'Signed amount in centavos: positive credits, negative debits.' },
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'PHP',
    },
    {
      name: 'source_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Wallet top-up', value: 'wallet_topup' },
        { label: 'Order', value: 'order' },
        { label: 'Refund', value: 'refund' },
        { label: 'Admin adjustment', value: 'admin_adjustment' },
      ],
    },
    {
      name: 'source_id',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
  indexes: [
    { fields: ['wallet', 'createdAt'] },
    { fields: ['source_type', 'source_id'], unique: true },
  ],
}

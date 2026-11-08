import type { CollectionConfig } from 'payload'

export const DeliveryFulfillmentAttempts: CollectionConfig = {
  slug: 'delivery-fulfillment-attempts',
  admin: {
    useAsTitle: 'request_id',
    defaultColumns: ['outbox', 'attempt_number', 'status', 'started_at', 'completed_at'],
    group: 'Ordering System',
    description: 'Audit trail for each Lalamove delivery booking attempt',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'outbox',
      type: 'relationship',
      relationTo: 'delivery-fulfillment-outbox',
      required: true,
    },
    { name: 'attempt_number', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'started',
      options: [
        { label: 'Started', value: 'started' },
        { label: 'Booked', value: 'booked' },
        { label: 'Retryable', value: 'retryable' },
        { label: 'Unknown outcome', value: 'unknown' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'request_id', type: 'text', required: true },
    { name: 'lalamove_order_id', type: 'text' },
    { name: 'http_status', type: 'number' },
    { name: 'error', type: 'textarea' },
    { name: 'started_at', type: 'date', required: true },
    { name: 'completed_at', type: 'date' },
  ],
  indexes: [
    { fields: ['outbox', 'attempt_number'] },
    { fields: ['request_id'], unique: true },
  ],
}

import type { CollectionConfig } from 'payload'

export const DeliveryFulfillmentOutbox: CollectionConfig = {
  slug: 'delivery-fulfillment-outbox',
  admin: {
    useAsTitle: 'order',
    defaultColumns: [
      'order',
      'status',
      'attempt_count',
      'last_attempt_at',
      'manual_intervention_required',
    ],
    group: 'Ordering System',
    description: 'Durable delivery fulfillment work and reconciliation status',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Submitting', value: 'submitting' },
        { label: 'Booked', value: 'booked' },
        { label: 'Retryable', value: 'retryable' },
        { label: 'Unknown outcome', value: 'unknown' },
        { label: 'Reconciliation required', value: 'reconciliation_required' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'attempt_count', type: 'number', required: true, defaultValue: 0 },
    { name: 'next_attempt_at', type: 'date' },
    { name: 'lease_expires_at', type: 'date' },
    { name: 'last_attempt_at', type: 'date' },
    { name: 'lalamove_order_id', type: 'text' },
    { name: 'last_request_id', type: 'text' },
    { name: 'last_error', type: 'textarea' },
    { name: 'manual_intervention_required', type: 'checkbox', defaultValue: false },
    { name: 'manual_alerted_at', type: 'date' },
    { name: 'reconciliation_note', type: 'textarea' },
  ],
  indexes: [
    { fields: ['status', 'next_attempt_at'] },
    { fields: ['status', 'lease_expires_at'] },
    { fields: ['lalamove_order_id'] },
    { fields: ['status', 'manual_intervention_required'] },
    { fields: ['manual_alerted_at'] },
  ],
}

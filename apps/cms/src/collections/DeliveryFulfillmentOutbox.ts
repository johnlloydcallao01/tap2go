import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

function relationId(value: unknown): string | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  return raw == null ? null : String(raw)
}

export function guardDeliveryFulfillmentOutboxChange({
  data,
  operation,
  originalDoc,
}: {
  data: Record<string, unknown>
  operation: 'create' | 'update'
  originalDoc?: Record<string, unknown> | null
}) {
  if (operation === 'create') {
    if (
      data.submission_started_at != null ||
      (data.status != null && data.status !== 'pending') ||
      (data.attempt_count != null && Number(data.attempt_count) !== 0)
    ) {
      throw new APIError('Outbox records can only be created in the initial pending state.', 409)
    }
    return data
  }

  const originalLatch = originalDoc?.submission_started_at
  if (
    originalLatch != null &&
    Object.prototype.hasOwnProperty.call(data, 'submission_started_at') &&
    String(data.submission_started_at) !== String(originalLatch)
  ) {
    throw new APIError('A Lalamove submission latch cannot be changed or cleared.', 409)
  }

  if (
    Object.prototype.hasOwnProperty.call(data, 'order') &&
    relationId(data.order) !== relationId(originalDoc?.order)
  ) {
    throw new APIError('An outbox record cannot be moved to another order.', 409)
  }

  const hasSubmissionLatch = originalLatch != null || data.submission_started_at != null
  const nextStatus = data.status ?? originalDoc?.status
  if (
    hasSubmissionLatch &&
    ['pending', 'retryable', 'submitting'].includes(String(nextStatus)) &&
    nextStatus !== originalDoc?.status
  ) {
    throw new APIError('A submitted Lalamove order cannot return to a retryable state.', 409)
  }

  if (
    originalLatch == null &&
    data.submission_started_at != null &&
    nextStatus !== 'submitting'
  ) {
    throw new APIError('The Lalamove submission latch can only be set while submitting.', 409)
  }

  return data
}

export function guardDeliveryFulfillmentOutboxDelete({
  doc,
}: {
  doc: Record<string, unknown>
}) {
  if (doc.submission_started_at != null) {
    throw new APIError('An outbox record with a Lalamove submission latch cannot be deleted.', 409)
  }
}

export const DeliveryFulfillmentOutbox: CollectionConfig = {
  slug: 'delivery-fulfillment-outbox',
  admin: {
    useAsTitle: 'order',
    defaultColumns: [
      'order',
      'status',
      'attempt_count',
      'last_attempt_at',
      'submission_started_at',
      'manual_intervention_required',
    ],
    group: 'Ordering System',
    description: 'Durable delivery fulfillment work and reconciliation status',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) =>
        guardDeliveryFulfillmentOutboxChange({
          data,
          operation,
          originalDoc: originalDoc as Record<string, unknown> | null,
        }),
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: 'delivery-fulfillment-outbox',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (!doc) return
        guardDeliveryFulfillmentOutboxDelete({
          doc: doc as unknown as Record<string, unknown>,
        })
      },
    ],
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
    {
      name: 'submission_started_at',
      type: 'date',
      admin: { readOnly: true },
    },
    { name: 'lalamove_order_id', type: 'text' },
    { name: 'rider_remarks', type: 'textarea', maxLength: 1500 },
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

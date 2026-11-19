import type { CollectionConfig } from 'payload'

export const DeliveryLocationHistory: CollectionConfig = {
  slug: 'delivery-location-history',
  admin: {
    useAsTitle: 'observed_at',
    defaultColumns: ['order', 'driver_id', 'observed_at'],
    group: 'Ordering System',
    description: 'Sampled Lalamove driver coordinates for delivery tracking',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
    update: () => false,
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'service',
  },
  indexes: [
    {
      fields: ['order', 'driver_id', 'observed_at'],
    },
  ],
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'driver_id',
      type: 'text',
      required: true,
    },
    {
      name: 'latitude',
      type: 'number',
      required: true,
      min: -90,
      max: 90,
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      min: -180,
      max: 180,
    },
    {
      name: 'provider_updated_at',
      type: 'text',
    },
    {
      name: 'observed_at',
      type: 'date',
      required: true,
    },
    {
      name: 'dedupe_key',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true },
    },
  ],
}

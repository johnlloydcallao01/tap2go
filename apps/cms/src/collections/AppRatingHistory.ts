import type { CollectionConfig } from 'payload'

export const AppRatingHistory: CollectionConfig = {
  slug: 'app-rating-history',
  admin: {
    useAsTitle: 'original_rating_id',
    defaultColumns: ['original_rating_id', 'customer', 'order', 'rating', 'createdAt'],
    group: 'Ordering System',
    description: 'Original per-order app rating snapshots preserved during customer-level migration and rollback',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'service' || user?.role === 'admin' || false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'original_rating_id',
      type: 'number',
      required: true,
      unique: true,
      admin: { description: 'ID of the original app rating before it was archived' },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
    },
    {
      name: 'original_created_at',
      type: 'date',
      required: true,
    },
    {
      name: 'original_updated_at',
      type: 'date',
      required: true,
    },
  ],
  indexes: [
    { fields: ['customer', 'original_created_at'] },
  ],
}

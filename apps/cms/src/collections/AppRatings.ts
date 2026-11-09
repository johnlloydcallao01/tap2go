import type { CollectionConfig } from 'payload'

export const AppRatings: CollectionConfig = {
  slug: 'app-ratings',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['customer', 'rating', 'order', 'updatedAt'],
    group: 'Ordering System',
    description: 'Customer ratings and feedback about the Tap2Go app after completed orders',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'service' || user?.role === 'admin' || false,
    create: ({ req: { user } }) => user?.role === 'service' || user?.role === 'admin' || false,
    update: ({ req: { user } }) => user?.role === 'service' || user?.role === 'admin' || false,
    delete: ({ req: { user } }) => user?.role === 'service' || user?.role === 'admin' || false,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      admin: {
        description: 'First completed order that made the customer eligible to rate the app',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      unique: true,
      admin: {
        description: 'Customer account with one current app rating',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      validate: (value: unknown) => (
        value == null || Number.isInteger(value)
          ? true
          : 'Rating must be a whole number from 1 to 5.'
      ),
      admin: {
        description: 'App rating from 1 to 5 stars',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      maxLength: 4000,
      admin: {
        description: 'Optional written feedback about the app',
      },
    },
  ],
  indexes: [
    { fields: ['rating', 'createdAt'] },
  ],
}

import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'srn', 'enrollmentDate', 'currentLevel'],
  },
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) {
        // Allow service accounts and admins to read all customer data
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
      }
      
      // Block all unauthenticated requests and other roles
      return false
    },
    create: ({ req: { user } }) => {
      // Allow service accounts and admins to create customer records
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow service accounts and admins to update customer records
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow service accounts and admins to delete customer records
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'Link to user account',
      },
    },

    // ROLE-SPECIFIC FIELDS (customer learning data)
    {
      name: 'srn',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Student Registration Number (unique identifier)',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      admin: {
        description: 'Marketing coupon code used during registration',
      },
    },
    {
      name: 'enrollmentDate',
      type: 'date',
      admin: {
        description: 'Date when customer enrolled in the program',
      },
    },
    {
      name: 'currentLevel',
      type: 'select',
      options: [
        {
          label: 'Beginner',
          value: 'beginner',
        },
        {
          label: 'Intermediate',
          value: 'intermediate',
        },
        {
          label: 'Advanced',
          value: 'advanced',
        },
      ],
      defaultValue: 'beginner',
      admin: {
        description: 'Current learning level',
      },
    },
    {
      name: 'activeAddress',
      type: 'relationship',
      relationTo: 'addresses',
      admin: {
        description: 'Currently selected active address for this customer (for food delivery)',
      },
    },

  ],
}

import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'srn', 'enrollmentDate', 'currentLevel'],
  },
  access: {
    read: adminOnly, // Only admins can read customer data
    create: adminOnly, // Only admins can create customer records
    update: adminOnly, // Only admins can update customer records
    delete: adminOnly, // Only admins can delete customer records
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

  ],
}

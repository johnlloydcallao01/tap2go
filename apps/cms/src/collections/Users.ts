import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'Manage all users in the Tap2Go platform (Admin, Driver, Vendor, Customer)',
  },
  auth: true,
  access: {
    // Only admins can read all users
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Users can only read their own profile
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Only admins can create users, or allow public registration for customers
    create: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Allow public registration (will be restricted to customer role)
      return true
    },
    // Users can update their own profile, admins can update anyone
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Driver',
          value: 'driver',
        },
        {
          label: 'Vendor',
          value: 'vendor',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
      defaultValue: 'customer',
      admin: {
        description: 'User role determines access permissions and features available',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Last Name',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Account Active',
      defaultValue: true,
      admin: {
        description: 'Inactive users cannot log in or use the platform',
        condition: (_, __, { user }) => {
          // Only admins can deactivate accounts
          return user?.role === 'admin'
        },
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      label: 'Account Verified',
      defaultValue: false,
      admin: {
        description: 'Verified status for users (used by admin interface)',
        condition: (_, __, { user }) => {
          // Only admins can verify accounts
          return user?.role === 'admin'
        },
      },
    },

  ],
  timestamps: true,
}

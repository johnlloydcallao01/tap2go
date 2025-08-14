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
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: {
        description: 'Required for drivers and vendors',
      },
    },

    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Account Active',
      defaultValue: true,
      admin: {
        description: 'Inactive users cannot log in or use the platform',
        condition: (data, siblingData, { user }) => {
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
        description: 'Verified status for drivers and vendors',
        condition: (data, siblingData, { user }) => {
          // Only admins can verify accounts
          return user?.role === 'admin'
        },
      },
    },
    // Driver-specific fields
    {
      name: 'driverProfile',
      type: 'group',
      label: 'Driver Profile',
      admin: {
        condition: (data) => data?.role === 'driver',
      },
      fields: [
        {
          name: 'licenseNumber',
          type: 'text',
          label: 'Driver License Number',
          admin: {
            description: 'Required for driver verification',
          },
        },
        {
          name: 'vehicleType',
          type: 'select',
          label: 'Vehicle Type',
          options: [
            { label: 'Motorcycle', value: 'motorcycle' },
            { label: 'Car', value: 'car' },
            { label: 'Bicycle', value: 'bicycle' },
            { label: 'Scooter', value: 'scooter' },
          ],
        },
        {
          name: 'vehiclePlateNumber',
          type: 'text',
          label: 'Vehicle Plate Number',
        },
        {
          name: 'bankAccount',
          type: 'group',
          label: 'Bank Account Details',
          fields: [
            {
              name: 'bankName',
              type: 'text',
              label: 'Bank Name',
            },
            {
              name: 'accountNumber',
              type: 'text',
              label: 'Account Number',
            },
            {
              name: 'accountHolderName',
              type: 'text',
              label: 'Account Holder Name',
            },
          ],
        },
        {
          name: 'isOnline',
          type: 'checkbox',
          label: 'Currently Online',
          defaultValue: false,
          admin: {
            description: 'Driver availability status',
          },
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Average Rating',
          admin: {
            step: 0.1,
            description: 'Average customer rating (0-5)',
            readOnly: true,
          },
          min: 0,
          max: 5,
        },
        {
          name: 'totalDeliveries',
          type: 'number',
          label: 'Total Deliveries',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    // Vendor-specific fields
    {
      name: 'vendorProfile',
      type: 'group',
      label: 'Vendor Profile',
      admin: {
        condition: (data) => data?.role === 'vendor',
      },
      fields: [
        {
          name: 'businessName',
          type: 'text',
          label: 'Business Name',
          required: true,
        },
        {
          name: 'businessRegistrationNumber',
          type: 'text',
          label: 'Business Registration Number',
          admin: {
            description: 'Required for vendor verification',
          },
        },
        {
          name: 'businessType',
          type: 'select',
          label: 'Business Type',
          options: [
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Fast Food', value: 'fast-food' },
            { label: 'Bakery', value: 'bakery' },
            { label: 'Grocery Store', value: 'grocery' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'businessAddress',
          type: 'group',
          label: 'Business Address',
          fields: [
            {
              name: 'street',
              type: 'text',
              label: 'Street Address',
              required: true,
            },
            {
              name: 'city',
              type: 'text',
              label: 'City',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
              label: 'State/Province',
            },
            {
              name: 'zipCode',
              type: 'text',
              label: 'ZIP/Postal Code',
            },
            {
              name: 'country',
              type: 'text',
              label: 'Country',
              defaultValue: 'Malaysia',
            },
          ],
        },
        {
          name: 'businessHours',
          type: 'array',
          label: 'Business Hours',
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'openTime',
              type: 'text',
              label: 'Opening Time',
              admin: {
                placeholder: 'e.g., 09:00',
              },
            },
            {
              name: 'closeTime',
              type: 'text',
              label: 'Closing Time',
              admin: {
                placeholder: 'e.g., 22:00',
              },
            },
            {
              name: 'isClosed',
              type: 'checkbox',
              label: 'Closed on this day',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'bankAccount',
          type: 'group',
          label: 'Bank Account Details',
          fields: [
            {
              name: 'bankName',
              type: 'text',
              label: 'Bank Name',
            },
            {
              name: 'accountNumber',
              type: 'text',
              label: 'Account Number',
            },
            {
              name: 'accountHolderName',
              type: 'text',
              label: 'Account Holder Name',
            },
          ],
        },
        {
          name: 'commissionRate',
          type: 'number',
          label: 'Commission Rate (%)',
          admin: {
            step: 0.1,
            description: 'Platform commission percentage',
            condition: (data, siblingData, { user }) => {
              return user?.role === 'admin'
            },
          },
          defaultValue: 15,
          min: 0,
          max: 50,
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Average Rating',
          admin: {
            step: 0.1,
            description: 'Average customer rating (0-5)',
            readOnly: true,
          },
          min: 0,
          max: 5,
        },
        {
          name: 'totalOrders',
          type: 'number',
          label: 'Total Orders',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },


  ],
  timestamps: true,
}

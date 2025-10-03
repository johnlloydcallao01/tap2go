import type { CollectionConfig } from 'payload'

export const Merchants: CollectionConfig = {
  slug: 'merchants',
  admin: {
    useAsTitle: 'outletName',
    defaultColumns: ['outletName', 'vendor', 'city', 'isActive', 'isAcceptingOrders', 'averageRating'],
    group: 'Food Delivery',
    description: 'Manage individual merchant locations and outlets',
  },
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) {
        // Allow service accounts (for website display) and admins
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
      }
      
      // Block all unauthenticated requests and other roles
      return false
    },
    create: ({ req: { user } }) => {
      // Allow both service accounts and admins to create merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete merchants
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === VENDOR RELATIONSHIP ===
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: {
        description: 'Parent vendor/business entity',
      },
    },

    // === LOCATION IDENTIFICATION ===
    {
      name: 'outletName',
      type: 'text',
      required: true,
      admin: {
        description: 'Specific outlet name (e.g., "Jollibee Manila", "McDonald\'s Quezon City")',
      },
    },
    {
      name: 'outletCode',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Internal reference code for the outlet (e.g., JB-MNL-001)',
      },
    },

    // === ADDRESS INFORMATION ===
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'streetAddress',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Complete street address',
          },
        },
        {
          name: 'barangay',
          type: 'text',
          admin: {
            description: 'Barangay',
          },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          admin: {
            description: 'City',
          },
        },
        {
          name: 'province',
          type: 'text',
          required: true,
          admin: {
            description: 'Province/State',
          },
        },
        {
          name: 'postalCode',
          type: 'text',
          admin: {
            description: 'Postal/ZIP code',
          },
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'Philippines',
          admin: {
            description: 'Country',
          },
        },
      ],
      admin: {
        description: 'Complete address information',
      },
    },

    // === GEOGRAPHIC COORDINATES ===
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          required: true,
          admin: {
            description: 'Latitude coordinate for delivery radius calculations',
            step: 0.000001,
          },
        },
        {
          name: 'longitude',
          type: 'number',
          required: true,
          admin: {
            description: 'Longitude coordinate for delivery radius calculations',
            step: 0.000001,
          },
        },
        {
          name: 'deliveryRadiusKm',
          type: 'number',
          defaultValue: 5,
          min: 0,
          max: 50,
          admin: {
            description: 'Delivery radius in kilometers',
            step: 0.1,
          },
        },
      ],
      admin: {
        description: 'Geographic location and delivery coverage',
      },
    },

    // === CONTACT INFORMATION ===
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Outlet contact phone number',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Outlet contact email',
          },
        },
        {
          name: 'managerName',
          type: 'text',
          admin: {
            description: 'Store manager name',
          },
        },
        {
          name: 'managerPhone',
          type: 'text',
          admin: {
            description: 'Store manager contact number',
          },
        },
      ],
      admin: {
        description: 'Contact information for this specific outlet',
      },
    },

    // === OPERATIONAL STATUS ===
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the merchant is currently active',
      },
    },
    {
      name: 'isAcceptingOrders',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the merchant is currently accepting new orders',
      },
    },
    {
      name: 'operationalStatus',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Busy', value: 'busy' },
        { label: 'Temporarily Closed', value: 'temp_closed' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      admin: {
        description: 'Current operational status',
      },
    },

    // === OPERATING HOURS ===
    {
      name: 'operatingHours',
      type: 'json',
      admin: {
        description: 'Weekly operating schedule (JSON format)',
      },
    },
    {
      name: 'specialHours',
      type: 'json',
      admin: {
        description: 'Special operating hours for holidays or events (JSON array of objects with date, openTime, closeTime, isClosed, reason)',
      },
    },

    // === DELIVERY SETTINGS ===
    {
      name: 'deliverySettings',
      type: 'group',
      fields: [
        {
          name: 'minimumOrderAmount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Minimum order amount (PHP)',
          },
        },
        {
          name: 'deliveryFee',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Base delivery fee (PHP)',
          },
        },
        {
          name: 'freeDeliveryThreshold',
          type: 'number',
          min: 0,
          admin: {
            description: 'Order amount for free delivery (PHP)',
          },
        },
        {
          name: 'estimatedDeliveryTimeMinutes',
          type: 'number',
          min: 5,
          max: 120,
          defaultValue: 30,
          admin: {
            description: 'Estimated delivery time in minutes',
          },
        },
        {
          name: 'maxDeliveryTimeMinutes',
          type: 'number',
          min: 10,
          max: 180,
          defaultValue: 60,
          admin: {
            description: 'Maximum delivery time promise',
          },
        },
      ],
      admin: {
        description: 'Delivery policies and settings',
      },
    },

    // === PERFORMANCE METRICS ===
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'averageRating',
          type: 'number',
          min: 0,
          max: 5,
          defaultValue: 0,
          admin: {
            description: 'Average customer rating',
            step: 0.1,
          },
        },
        {
          name: 'totalReviews',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total number of customer reviews',
          },
        },
        {
          name: 'totalOrders',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total orders processed',
          },
        },
        {
          name: 'averagePreparationTimeMinutes',
          type: 'number',
          min: 0,
          defaultValue: 20,
          admin: {
            description: 'Average food preparation time',
          },
        },
        {
          name: 'orderAcceptanceRate',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 100,
          admin: {
            description: 'Percentage of orders accepted',
            step: 0.1,
          },
        },
        {
          name: 'onTimeDeliveryRate',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 100,
          admin: {
            description: 'Percentage of on-time deliveries',
            step: 0.1,
          },
        },
      ],
      admin: {
        description: 'Performance tracking and analytics',
      },
    },

    // === MEDIA AND BRANDING ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Merchant thumbnail image (original size from Cloudinary)',
          },
        },
        {
          name: 'storeFrontImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Store front photo',
          },
        },
        {
          name: 'interiorImages',
          type: 'json',
          admin: {
            description: 'Interior photos of the outlet (JSON array of media IDs)',
          },
        },
        {
          name: 'menuImages',
          type: 'json',
          admin: {
            description: 'Menu board or promotional images (JSON array of media IDs)',
          },
        },
      ],
      admin: {
        description: 'Visual content for the merchant',
      },
    },



    // === COMPLIANCE AND CERTIFICATIONS ===
    {
      name: 'compliance',
      type: 'group',
      fields: [
        {
          name: 'businessPermitNumber',
          type: 'text',
          admin: {
            description: 'Local business permit number',
          },
        },
        {
          name: 'foodSafetyLicense',
          type: 'text',
          admin: {
            description: 'Food safety license number',
          },
        },
        {
          name: 'firePermitNumber',
          type: 'text',
          admin: {
            description: 'Fire safety permit number',
          },
        },
        {
          name: 'sanitaryPermitNumber',
          type: 'text',
          admin: {
            description: 'Sanitary permit number',
          },
        },
        {
          name: 'lastInspectionDate',
          type: 'date',
          admin: {
            description: 'Last health/safety inspection date',
          },
        },
        {
          name: 'inspectionScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Latest inspection score',
          },
        },
      ],
      admin: {
        description: 'Regulatory compliance and certifications',
      },
    },

    // === ADDITIONAL INFORMATION ===
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Outlet description and special features',
      },
    },
    {
      name: 'specialInstructions',
      type: 'textarea',
      admin: {
        description: 'Special delivery or pickup instructions',
      },
    },
    {
      name: 'tags',
      type: 'json',
      admin: {
        description: 'Tags for search and categorization (JSON array of strings)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate outlet code if not provided
        if (!data.outletCode && data.outletName && data.address?.city) {
          const name = data.outletName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()
          const city = data.address.city.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
          const timestamp = Date.now().toString().slice(-4)
          data.outletCode = `${name}-${city}-${timestamp}`
        }
        return data
      },
    ],
  },
}
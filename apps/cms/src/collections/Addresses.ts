import type { CollectionConfig } from 'payload'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  admin: {
    useAsTitle: 'formatted_address',
    defaultColumns: ['formatted_address', 'user', 'address_type', 'locality', 'is_default', 'is_verified'],
    group: 'User Management',
    description: 'Manage user addresses with Google Maps integration',
  },
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) {
        // Allow service accounts and admins to read all addresses
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
        // Allow customers to read their own addresses
        if (user.role === 'customer') {
          return {
            user: {
              equals: user.id,
            },
          }
        }
      }
      
      // Block all unauthenticated requests and other roles
      return false
    },
    create: ({ req: { user } }) => {
      // Allow service accounts, admins, and customers to create addresses
      return user?.role === 'service' || user?.role === 'admin' || user?.role === 'customer' || false
    },
    update: ({ req: { user } }) => {
      // If user exists, they've been authenticated
      if (user) {
        // Allow service accounts and admins to update all addresses
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
        // Allow customers to update their own addresses
        if (user.role === 'customer') {
          return {
            user: {
              equals: user.id,
            },
          }
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      // If user exists, they've been authenticated
      if (user) {
        // Allow service accounts and admins to delete all addresses
        if (user.role === 'service' || user.role === 'admin') {
          return true
        }
        // Allow customers to delete their own addresses
        if (user.role === 'customer') {
          return {
            user: {
              equals: user.id,
            },
          }
        }
      }
      return false
    },
  },
  fields: [
    // === USER RELATIONSHIP ===
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who owns this address',
      },
    },

    // === GOOGLE MAPS RAW DATA (STORE COMPLETE UNEDITED ADDRESS) ===
    {
      name: 'formatted_address',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Complete Google-formatted address (unedited from Google Maps)',
        rows: 3,
      },
    },
    {
      name: 'google_place_id',
      type: 'text',
      admin: {
        description: 'Google Place ID for reference and validation',
      },
    },

    // === PARSED ADDRESS COMPONENTS (FROM GOOGLE PLACES API) ===
    {
      name: 'street_number',
      type: 'text',
      admin: {
        description: 'Street number (from address_components: street_number)',
      },
    },
    {
      name: 'route',
      type: 'text',
      admin: {
        description: 'Street name (from address_components: route)',
      },
    },
    {
      name: 'subpremise',
      type: 'text',
      admin: {
        description: 'Unit/apartment number (from address_components: subpremise)',
      },
    },

    // === LOCALITY COMPONENTS (PHILIPPINES-SPECIFIC) ===
    {
      name: 'barangay',
      type: 'text',
      admin: {
        description: 'Barangay (from address_components: sublocality_level_1)',
      },
    },
    {
      name: 'locality',
      type: 'text',
      admin: {
        description: 'City/municipality (from address_components: locality)',
      },
    },
    {
      name: 'administrative_area_level_2',
      type: 'text',
      admin: {
        description: 'Province subdivision (from address_components: administrative_area_level_2)',
      },
    },
    {
      name: 'administrative_area_level_1',
      type: 'text',
      admin: {
        description: 'Province/state (from address_components: administrative_area_level_1)',
      },
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'Philippines',
      admin: {
        description: 'Country (from address_components: country)',
      },
    },
    {
      name: 'postal_code',
      type: 'text',
      admin: {
        description: 'ZIP/postal code (from address_components: postal_code)',
      },
    },

    // === GEOLOCATION DATA ===
    {
      name: 'latitude',
      type: 'number',
      admin: {
        description: 'Latitude coordinate (from geometry.location.lat)',
        step: 0.00000001,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      admin: {
        description: 'Longitude coordinate (from geometry.location.lng)',
        step: 0.00000001,
      },
    },

    // === ADDRESS METADATA ===
    {
      name: 'address_type',
      type: 'select',
      options: [
        {
          label: 'Home',
          value: 'home',
        },
        {
          label: 'Work',
          value: 'work',
        },
        {
          label: 'Billing',
          value: 'billing',
        },
        {
          label: 'Shipping',
          value: 'shipping',
        },
        {
          label: 'Pickup',
          value: 'pickup',
        },
        {
          label: 'Delivery',
          value: 'delivery',
        },
      ],
      defaultValue: 'home',
      required: true,
      admin: {
        description: 'Type of address for categorization',
      },
    },
    {
      name: 'is_default',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as default address for this user',
      },
    },
    {
      name: 'is_verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Address has been verified through Google Maps',
      },
    },

    // === AUDIT FIELDS ===
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or delivery instructions',
        rows: 2,
      },
    },
  ],
  
  // === INDEXES FOR PERFORMANCE ===
  indexes: [
    {
      fields: ['user'],
    },
    {
      fields: ['latitude', 'longitude'],
    },
    {
      fields: ['locality', 'administrative_area_level_1'],
    },
    {
      fields: ['postal_code'],
    },
    {
      fields: ['google_place_id'],
    },
  ],
}
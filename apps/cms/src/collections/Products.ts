import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'productType', 'basePrice', 'isActive', 'createdByVendor', 'createdByMerchant'],
    group: 'Food Delivery',
    description: 'Master product catalog for vendors and merchants',
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
      // Allow both service accounts and admins to create products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete products
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === OWNERSHIP TRACKING ===
    {
      name: 'createdByVendor',
      type: 'relationship',
      relationTo: 'vendors',
      admin: {
        description: 'Vendor that created this product (mutually exclusive with merchant)',
        condition: (data) => !data.createdByMerchant,
      },
    },
    {
      name: 'createdByMerchant',
      type: 'relationship',
      relationTo: 'merchants',
      admin: {
        description: 'Merchant that created this product (mutually exclusive with vendor)',
        condition: (data) => !data.createdByVendor,
      },
    },

    // === PRODUCT TYPE AND HIERARCHY ===
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'simple',
      options: [
        {
          label: 'Simple Product',
          value: 'simple',
        },
        {
          label: 'Variable Product',
          value: 'variable',
        },
        {
          label: 'Grouped Product',
          value: 'grouped',
        },
      ],
      admin: {
        description: 'Type of product (simple, variable for variations, or grouped for bundles)',
      },
    },
    {
      name: 'parentProduct',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Parent product (for variations, points to the variable product)',
        condition: (data) => data.productType === 'simple' && data.parentProduct,
      },
    },

    // === BASIC INFORMATION ===
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Product name',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Full product description',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Brief product description (max 500 characters)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: {
        description: 'Product category',
      },
    },

    // === SKU AND PRICING ===
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
      },
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Base price of the product',
        step: 0.01,
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for showing discounts',
        step: 0.01,
      },
    },

    // === MEDIA ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'primaryImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Primary product image',
          },
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
          admin: {
            description: 'Additional product images',
          },
        },
      ],
      admin: {
        description: 'Product images and media',
      },
    },

    // === STATUS ===
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the product is currently active',
      },
    },

    // === METADATA ===
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Creation timestamp',
        position: 'sidebar',
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last update timestamp',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Ensure exactly one owner is specified
        if (!data) {
          throw new Error('Data is required')
        }
        
        const hasVendor = !!data.createdByVendor
        const hasMerchant = !!data.createdByMerchant
        
        if (!hasVendor && !hasMerchant) {
          throw new Error('Product must be created by either a vendor or merchant')
        }
        
        if (hasVendor && hasMerchant) {
          throw new Error('Product cannot be created by both vendor and merchant')
        }
        
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Set timestamps
        if (!data) {
          throw new Error('Data is required')
        }
        
        const now = new Date()
        if (!data.createdAt) {
          data.createdAt = now
        }
        data.updatedAt = now
        
        return data
      },
    ],
  },
}
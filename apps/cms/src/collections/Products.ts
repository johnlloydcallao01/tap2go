import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'merchant', 'primaryCategory', 'basePrice', 'isAvailable', 'averageRating'],
    group: 'Food Delivery',
    description: 'Manage individual food items and products',
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
    // === CORE RELATIONSHIPS ===
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      required: true,
      admin: {
        description: 'Merchant/outlet that sells this product',
      },
    },
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      admin: {
        description: 'Primary category for this product',
      },
    },

    // === BASIC PRODUCT INFORMATION ===
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Product name (e.g., "Chicken Joy", "Big Mac", "Iced Coffee")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'URL-friendly version of the name (auto-generated if empty)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed product description for customers',
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Brief description for product listings',
      },
    },

    // === PRICING INFORMATION ===
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'basePrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Base price in PHP',
            step: 0.01,
          },
        },
        {
          name: 'discountedPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Discounted price (if on sale)',
            step: 0.01,
          },
        },
        {
          name: 'costPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Cost price for profit margin calculations',
            step: 0.01,
          },
        },

      ],
      admin: {
        description: 'Pricing information and history',
      },
    },

    // === PRODUCT IDENTIFICATION ===
    {
      name: 'identification',
      type: 'group',
      fields: [
        {
          name: 'sku',
          type: 'text',
          unique: true,
          admin: {
            description: 'Stock Keeping Unit (SKU)',
          },
        },
        {
          name: 'barcode',
          type: 'text',
          admin: {
            description: 'Product barcode',
          },
        },
        {
          name: 'productCode',
          type: 'text',
          admin: {
            description: 'Internal product code',
          },
        },
      ],
      admin: {
        description: 'Product identification codes',
      },
    },

    // === PHYSICAL ATTRIBUTES ===
    {
      name: 'physicalAttributes',
      type: 'group',
      fields: [
        {
          name: 'weightGrams',
          type: 'number',
          min: 0,
          admin: {
            description: 'Product weight in grams',
          },
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'length',
              type: 'number',
              min: 0,
              admin: {
                description: 'Length in cm',
              },
            },
            {
              name: 'width',
              type: 'number',
              min: 0,
              admin: {
                description: 'Width in cm',
              },
            },
            {
              name: 'height',
              type: 'number',
              min: 0,
              admin: {
                description: 'Height in cm',
              },
            },
          ],
        },
        {
          name: 'volume',
          type: 'number',
          min: 0,
          admin: {
            description: 'Volume in ml (for beverages)',
          },
        },
        {
          name: 'servingSize',
          type: 'text',
          admin: {
            description: 'Serving size description (e.g., "1 piece", "250ml")',
          },
        },
      ],
      admin: {
        description: 'Physical product attributes',
      },
    },

    // === NUTRITIONAL INFORMATION ===
    {
      name: 'nutrition',
      type: 'group',
      fields: [
        {
          name: 'calories',
          type: 'number',
          min: 0,
          admin: {
            description: 'Calories per serving',
          },
        },
        {
          name: 'macronutrients',
          type: 'group',
          fields: [
            {
              name: 'protein',
              type: 'number',
              min: 0,
              admin: {
                description: 'Protein in grams',
                step: 0.1,
              },
            },
            {
              name: 'carbohydrates',
              type: 'number',
              min: 0,
              admin: {
                description: 'Carbohydrates in grams',
                step: 0.1,
              },
            },
            {
              name: 'fat',
              type: 'number',
              min: 0,
              admin: {
                description: 'Fat in grams',
                step: 0.1,
              },
            },
            {
              name: 'fiber',
              type: 'number',
              min: 0,
              admin: {
                description: 'Fiber in grams',
                step: 0.1,
              },
            },
            {
              name: 'sugar',
              type: 'number',
              min: 0,
              admin: {
                description: 'Sugar in grams',
                step: 0.1,
              },
            },
            {
              name: 'sodium',
              type: 'number',
              min: 0,
              admin: {
                description: 'Sodium in mg',
                step: 0.1,
              },
            },
          ],
        },

      ],
      admin: {
        description: 'Nutritional information and facts',
      },
    },

    // === DIETARY AND ALLERGEN INFORMATION ===
    {
      name: 'dietary',
      type: 'group',
      fields: [
        {
          name: 'isVegetarian',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isVegan',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isGlutenFree',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isHalal',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isKosher',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isOrganic',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isDairyFree',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isNutFree',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'spiceLevel',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Mild', value: 'mild' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hot', value: 'hot' },
            { label: 'Extra Hot', value: 'extra_hot' },
          ],
          defaultValue: 'none',
        },
        {
          name: 'allergens',
          type: 'json',
          admin: {
            description: 'Known allergens present in this product (JSON array of strings)',
          },
        },
        {
          name: 'ingredients',
          type: 'json',
          admin: {
            description: 'List of ingredients in this product (JSON array of strings)',
          },
        },
      ],
      admin: {
        description: 'Dietary restrictions and allergen information',
      },
    },

    // === AVAILABILITY AND INVENTORY ===
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'isAvailable',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether the product is currently available',
          },
        },
        {
          name: 'stockQuantity',
          type: 'number',
          min: 0,
          admin: {
            description: 'Current stock quantity',
          },
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          min: 0,
          defaultValue: 5,
          admin: {
            description: 'Alert when stock falls below this number',
          },
        },
        {
          name: 'maxOrderQuantity',
          type: 'number',
          min: 1,
          admin: {
            description: 'Maximum quantity per order',
          },
        },
        {
          name: 'availableHours',
          type: 'json',
          admin: {
            description: 'Hours when this product is available (JSON format)',
          },
        },
        {
          name: 'seasonalAvailability',
          type: 'json',
          admin: {
            description: 'Seasonal availability periods (JSON array of objects with season, startDate, endDate)',
          },
        },
      ],
      admin: {
        description: 'Availability and inventory management',
      },
    },

    // === PREPARATION AND TIMING ===
    {
      name: 'preparation',
      type: 'group',
      fields: [
        {
          name: 'preparationTimeMinutes',
          type: 'number',
          min: 0,
          defaultValue: 15,
          admin: {
            description: 'Time needed to prepare this item',
          },
        },
        {
          name: 'cookingMethod',
          type: 'select',
          options: [
            { label: 'Grilled', value: 'grilled' },
            { label: 'Fried', value: 'fried' },
            { label: 'Baked', value: 'baked' },
            { label: 'Steamed', value: 'steamed' },
            { label: 'Boiled', value: 'boiled' },
            { label: 'Raw', value: 'raw' },
            { label: 'No Cooking', value: 'no_cooking' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'specialInstructions',
          type: 'textarea',
          admin: {
            description: 'Special preparation or handling instructions',
          },
        },
        {
          name: 'requiresSpecialEquipment',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Preparation and cooking information',
      },
    },

    // === MEDIA AND PRESENTATION ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'primaryImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Main product image',
          },
        },

        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Product video (preparation, presentation)',
          },
        },
      ],
      admin: {
        description: 'Visual content for the product',
      },
    },

    // === PRODUCT STATUS ===
    {
      name: 'status',
      type: 'group',
      fields: [
        {
          name: 'isFeatured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether to feature this product prominently',
          },
        },
        {
          name: 'isNewItem',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as new item',
          },
        },
        {
          name: 'isPopular',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as popular item',
          },
        },
        {
          name: 'isRecommended',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as recommended by chef/staff',
          },
        },
        {
          name: 'displayOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Order for displaying products (lower numbers appear first)',
          },
        },
      ],
      admin: {
        description: 'Product status and display settings',
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
            readOnly: true,
          },
        },
        {
          name: 'totalReviews',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total number of reviews',
            readOnly: true,
          },
        },
        {
          name: 'totalOrders',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total times ordered',
            readOnly: true,
          },
        },
        {
          name: 'viewCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of times viewed',
            readOnly: true,
          },
        },
        {
          name: 'popularityScore',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Calculated popularity score',
            readOnly: true,
          },
        },
        {
          name: 'reorderRate',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Percentage of customers who reorder this item',
            readOnly: true,
            step: 0.1,
          },
        },
      ],
      admin: {
        description: 'Performance analytics and metrics',
      },
    },

    // === SEO AND MARKETING ===
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'SEO meta title',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'SEO meta description',
          },
        },

      ],
      admin: {
        description: 'SEO optimization settings',
      },
    },

    // === ADDITIONAL METADATA ===
    {
      name: 'tags',
      type: 'json',
      admin: {
        description: 'Product tags for search and categorization (JSON array of strings)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the product',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        }

        // Auto-generate SKU if not provided
        if (!data.identification?.sku && data.name && data.merchant) {
          const nameCode = data.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()
          const timestamp = Date.now().toString().slice(-6)
          data.identification = {
            ...data.identification,
            sku: `${nameCode}-${timestamp}`
          }
        }

        return data
      },
    ],
  },
}
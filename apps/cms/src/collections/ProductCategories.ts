import type { CollectionConfig } from 'payload'

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  dbName: 'prod_categories', // Shortened database table name
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'categoryLevel', 'parentCategory', 'isActive', 'isFeatured'],
    group: 'Food Delivery',
    description: 'Organize products into hierarchical categories for easy browsing',
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
      // Allow both service accounts and admins to create product categories
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Allow both service accounts and admins to update product categories
      return user?.role === 'service' || user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Allow both service accounts and admins to delete product categories
      return user?.role === 'service' || user?.role === 'admin' || false
    },
  },
  fields: [
    // === BASIC CATEGORY INFORMATION ===
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Category name (e.g., "Main Dishes", "Beverages", "Desserts")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the name (auto-generated if empty)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Category description for customers',
      },
    },

    // === HIERARCHICAL STRUCTURE ===
    {
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: {
        description: 'Parent category (leave empty for top-level categories)',
      },
    },
    {
      name: 'categoryLevel',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 1,
      admin: {
        description: 'Hierarchy level (1 = top level, 2 = subcategory, etc.)',
      },
    },
    {
      name: 'categoryPath',
      type: 'text',
      admin: {
        description: 'Materialized path for efficient queries (auto-generated)',
        readOnly: true,
      },
    },

    // === DISPLAY AND ORDERING ===
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order for displaying categories (lower numbers appear first)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the category is currently active',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether to feature this category prominently',
      },
    },

    // === VISUAL ELEMENTS ===
    {
      name: 'media',
      type: 'group',
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Category icon (SVG preferred)',
          },
        },
        {
          name: 'bannerImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Banner image for category pages',
          },
        },
        {
          name: 'thumbnailImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Thumbnail for category listings',
          },
        },
      ],
      admin: {
        description: 'Visual elements for the category',
      },
    },

    // === STYLING AND BRANDING ===
    {
      name: 'styling',
      type: 'group',
      fields: [
        {
          name: 'colorTheme',
          type: 'text',
          admin: {
            description: 'Hex color code for category theme (e.g., #FF6B35)',
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          admin: {
            description: 'Background color for category cards',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          admin: {
            description: 'Text color for category elements',
          },
        },
        {
          name: 'gradientColors',
          type: 'array',
          fields: [
            {
              name: 'color',
              type: 'text',
              admin: {
                description: 'Gradient color (hex code)',
              },
            },
          ],
          admin: {
            description: 'Colors for gradient backgrounds',
          },
        },
      ],
      admin: {
        description: 'Visual styling options',
      },
    },

    // === CATEGORY ATTRIBUTES ===
    {
      name: 'attributes',
      type: 'group',
      fields: [
        {
          name: 'categoryType',
          type: 'select',
          options: [
            { label: 'Food', value: 'food' },
            { label: 'Beverages', value: 'beverages' },
            { label: 'Desserts', value: 'desserts' },
            { label: 'Snacks', value: 'snacks' },
            { label: 'Groceries', value: 'groceries' },
            { label: 'Pharmacy', value: 'pharmacy' },
            { label: 'Personal Care', value: 'personal_care' },
            { label: 'Household', value: 'household' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Type of products in this category',
          },
        },
        {
          name: 'dietaryTags',
          type: 'array',
          fields: [
            {
              name: 'tag',
              type: 'select',
              options: [
                { label: 'Vegetarian', value: 'vegetarian' },
                { label: 'Vegan', value: 'vegan' },
                { label: 'Gluten-Free', value: 'gluten_free' },
                { label: 'Halal', value: 'halal' },
                { label: 'Kosher', value: 'kosher' },
                { label: 'Organic', value: 'organic' },
                { label: 'Low-Carb', value: 'low_carb' },
                { label: 'Keto', value: 'keto' },
                { label: 'Dairy-Free', value: 'dairy_free' },
                { label: 'Nut-Free', value: 'nut_free' },
                { label: 'Spicy', value: 'spicy' },
                { label: 'Healthy', value: 'healthy' },
              ],
            },
          ],
          admin: {
            description: 'Dietary attributes commonly found in this category',
          },
        },
        {
          name: 'ageRestriction',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: '18+', value: '18_plus' },
            { label: '21+', value: '21_plus' },
          ],
          defaultValue: 'none',
          admin: {
            description: 'Age restriction for products in this category',
          },
        },
        {
          name: 'requiresPrescription',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether products in this category require prescription',
          },
        },
      ],
      admin: {
        description: 'Category-specific attributes and restrictions',
      },
    },

    // === BUSINESS RULES ===
    {
      name: 'businessRules',
      type: 'group',
      fields: [
        {
          name: 'allowsCustomization',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether products in this category can be customized',
          },
        },
        {
          name: 'requiresSpecialHandling',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether products need special delivery handling',
          },
        },
        {
          name: 'hasExpirationDates',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether products in this category have expiration dates',
          },
        },
        {
          name: 'requiresRefrigeration',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether products need refrigerated delivery',
          },
        },
        {
          name: 'maxDeliveryTimeHours',
          type: 'number',
          min: 0.5,
          max: 72,
          admin: {
            description: 'Maximum delivery time for products in this category (hours)',
            step: 0.5,
          },
        },
      ],
      admin: {
        description: 'Business rules and handling requirements',
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
        {
          name: 'keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
          admin: {
            description: 'SEO keywords for this category',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Canonical URL for SEO',
          },
        },
      ],
      admin: {
        description: 'SEO optimization settings',
      },
    },

    // === ANALYTICS AND METRICS ===
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'totalProducts',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total number of products in this category',
            readOnly: true,
          },
        },
        {
          name: 'totalOrders',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total orders from this category',
            readOnly: true,
          },
        },
        {
          name: 'averageRating',
          type: 'number',
          min: 0,
          max: 5,
          defaultValue: 0,
          admin: {
            description: 'Average rating of products in this category',
            readOnly: true,
            step: 0.1,
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
          name: 'viewCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of times this category was viewed',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Analytics and performance metrics',
      },
    },

    // === PROMOTIONAL SETTINGS ===
    {
      name: 'promotions',
      type: 'group',
      fields: [
        {
          name: 'isPromotional',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this category is currently being promoted',
          },
        },
        {
          name: 'promotionalText',
          type: 'text',
          admin: {
            description: 'Promotional text to display with the category',
          },
        },
        {
          name: 'discountPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Category-wide discount percentage',
            step: 0.1,
          },
        },
        {
          name: 'promotionStartDate',
          type: 'date',
          admin: {
            description: 'When the promotion starts',
          },
        },
        {
          name: 'promotionEndDate',
          type: 'date',
          admin: {
            description: 'When the promotion ends',
          },
        },
      ],
      admin: {
        description: 'Promotional campaigns and discounts',
      },
    },

    // === AVAILABILITY SETTINGS ===
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'availableHours',
          type: 'json',
          admin: {
            description: 'Hours when this category is available (JSON format)',
          },
        },
        {
          name: 'seasonalAvailability',
          type: 'array',
          fields: [
            {
              name: 'season',
              type: 'select',
              options: [
                { label: 'Spring', value: 'spring' },
                { label: 'Summer', value: 'summer' },
                { label: 'Fall', value: 'fall' },
                { label: 'Winter', value: 'winter' },
                { label: 'Holiday', value: 'holiday' },
                { label: 'Special', value: 'special' },
              ],
            },
            {
              name: 'available',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
          admin: {
            description: 'Seasonal availability settings',
          },
        },
        {
          name: 'regionRestrictions',
          type: 'array',
          fields: [
            {
              name: 'region',
              type: 'text',
            },
            {
              name: 'restricted',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
          admin: {
            description: 'Regional availability restrictions',
          },
        },
      ],
      admin: {
        description: 'Availability and restriction settings',
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

        // Generate category path for hierarchical queries
        if (data.parentCategory && typeof data.parentCategory === 'object') {
          const parentPath = data.parentCategory.categoryPath || data.parentCategory.slug || ''
          data.categoryPath = parentPath ? `${parentPath}/${data.slug}` : data.slug
          data.categoryLevel = (data.parentCategory.categoryLevel || 0) + 1
        } else {
          data.categoryPath = data.slug
          data.categoryLevel = 1
        }

        return data
      },
    ],
  },
}
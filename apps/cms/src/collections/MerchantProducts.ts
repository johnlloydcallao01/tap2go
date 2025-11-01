import { CollectionConfig } from 'payload'

export const MerchantProducts: CollectionConfig = {
  slug: 'merchant-products',
  labels: {
    singular: 'Merchant Product',
    plural: 'Merchant Products',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['merchant_id', 'product_id', 'added_by', 'is_active', 'is_available'],
    group: 'Product Management',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'merchant_id',
      type: 'relationship',
      relationTo: 'merchants',
      required: true,
      label: 'Merchant',
    },
    {
      name: 'product_id',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Product',
      filterOptions: async ({ relationTo: _relationTo, data, user: _user, req }) => {
        // Only show products that belong to the same vendor as the selected merchant
        if (data?.merchant_id) {
          try {
            // Get the merchant to find its vendor
            const merchant = await req.payload.findByID({
              collection: 'merchants',
              id: data.merchant_id,
              depth: 1, // Populate the vendor relationship
            })

            // Validate that merchant exists and has a valid vendor
            if (merchant?.vendor) {
              let vendorId;
              
              // Handle both populated vendor object and vendor ID
              if (typeof merchant.vendor === 'object' && merchant.vendor.id) {
                vendorId = merchant.vendor.id;
              } else if (typeof merchant.vendor === 'string' || typeof merchant.vendor === 'number') {
                vendorId = merchant.vendor;
              }

              // Ensure vendorId is valid and not NaN
              if (vendorId && !isNaN(Number(vendorId))) {
                return {
                  createdByVendor: {
                    equals: vendorId,
                  },
                }
              }
            }
          } catch (error) {
            console.error('Error filtering products by merchant vendor:', error)
          }
        }

        // If no merchant selected, invalid vendor, or error occurred, show no products
        return false
      },
      admin: {
        description: 'Product (filtered to show only products owned by the merchant\'s vendor)',
      },
    },
    {
      name: 'added_by',
      type: 'select',
      options: [
        { label: 'Vendor', value: 'vendor' },
        { label: 'Merchant', value: 'merchant' },
      ],
      label: 'Added By',
      admin: {
        description: 'Who assigned this product to the merchant',
      },
    },
    {
      name: 'price_override',
      type: 'number',
      label: 'Price Override',
      admin: {
        description: 'Override product price (null = use product default)',
        step: 0.01,
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Is Active',
    },
    {
      name: 'is_available',
      type: 'checkbox',
      defaultValue: true,
      label: 'Is Available',
      admin: {
        description: 'Quick toggle on/off',
      },
    },
  ],
  timestamps: true,
}
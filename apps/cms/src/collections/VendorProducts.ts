import { CollectionConfig } from 'payload'

export const VendorProducts: CollectionConfig = {
  slug: 'vendor-products',
  labels: {
    singular: 'Vendor Product',
    plural: 'Vendor Products',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['vendor_id', 'product_id', 'is_active', 'auto_assign_to_new_merchants'],
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
      name: 'vendor_id',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      label: 'Vendor',
    },
    {
      name: 'product_id',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Product',
    },
    {
      name: 'auto_assign_to_new_merchants',
      type: 'checkbox',
      defaultValue: false,
      label: 'Auto Assign to New Merchants',
      admin: {
        description: 'Automatically assign this product to new merchants',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Is Active',
    },
  ],
  timestamps: true,
}
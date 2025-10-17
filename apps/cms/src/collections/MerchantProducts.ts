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
    },
    {
      name: 'added_by',
      type: 'select',
      required: true,
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
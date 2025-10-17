import { CollectionConfig } from 'payload'

export const ProdVariations: CollectionConfig = {
  slug: 'prod-variations',
  labels: {
    singular: 'Product Variation',
    plural: 'Product Variations',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['product_id', 'attribute_id', 'is_used_for_variations', 'is_visible'],
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
      name: 'product_id',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Variable Product',
      admin: {
        description: 'The variable product this variation belongs to',
      },
    },
    {
      name: 'attribute_id',
      type: 'relationship',
      relationTo: 'prod-attributes',
      required: true,
      label: 'Product Attribute',
      admin: {
        description: 'The attribute used for this variation',
      },
    },
    {
      name: 'is_used_for_variations',
      type: 'checkbox',
      defaultValue: true,
      label: 'Used for Variations',
      admin: {
        description: 'Whether this attribute is used to create variations',
      },
    },
    {
      name: 'is_visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible',
      admin: {
        description: 'Whether shown on product page',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      label: 'Sort Order',
    },
  ],
  timestamps: true,
}
import { CollectionConfig } from 'payload'

export const ProdVariationValues: CollectionConfig = {
  slug: 'prod-variation-values',
  labels: {
    singular: 'Product Variation Value',
    plural: 'Product Variation Values',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['variation_product_id', 'attribute_id', 'term_id'],
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
      name: 'variation_product_id',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Variation Product',
      admin: {
        description: 'The variation (child product)',
      },
    },
    {
      name: 'attribute_id',
      type: 'relationship',
      relationTo: 'prod-attributes',
      required: true,
      label: 'Product Attribute',
    },
    {
      name: 'term_id',
      type: 'relationship',
      relationTo: 'prod-attribute-terms',
      required: true,
      label: 'Attribute Term',
      admin: {
        description: 'The specific value for this attribute',
      },
    },
  ],
  timestamps: true,
}
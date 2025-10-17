import { CollectionConfig } from 'payload'

export const ProdAttributeTerms: CollectionConfig = {
  slug: 'prod-attribute-terms',
  labels: {
    singular: 'Product Attribute Term',
    plural: 'Product Attribute Terms',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'attribute_id', 'slug', 'value', 'is_active'],
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
      name: 'attribute_id',
      type: 'relationship',
      relationTo: 'prod-attributes',
      required: true,
      label: 'Product Attribute',
      admin: {
        description: 'The attribute this term belongs to',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
      label: 'Term Name',
      admin: {
        description: 'e.g., Small, Red, Vanilla',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      maxLength: 100,
      label: 'Slug',
      admin: {
        description: 'URL-friendly version of the name',
      },
    },
    {
      name: 'value',
      type: 'text',
      maxLength: 100,
      label: 'Value',
      admin: {
        description: 'For color type, stores hex code',
      },
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      label: 'Sort Order',
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
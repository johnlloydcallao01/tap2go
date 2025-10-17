import { CollectionConfig } from 'payload'

export const ProdAttributes: CollectionConfig = {
  slug: 'prod-attributes',
  labels: {
    singular: 'Product Attribute',
    plural: 'Product Attributes',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'type', 'is_active'],
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
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
      label: 'Attribute Name',
      admin: {
        description: 'e.g., Size, Color, Flavor',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      maxLength: 100,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly version of the name',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'select',
      options: [
        { label: 'Select', value: 'select' },
        { label: 'Color', value: 'color' },
        { label: 'Button', value: 'button' },
        { label: 'Radio', value: 'radio' },
      ],
      label: 'Attribute Type',
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
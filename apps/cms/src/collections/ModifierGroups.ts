import { CollectionConfig } from 'payload'

export const ModifierGroups: CollectionConfig = {
  slug: 'modifier-groups',
  labels: {
    singular: 'Modifier Group',
    plural: 'Modifier Groups',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'product_id', 'selection_type', 'is_required'],
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
      label: 'Product',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
      label: 'Group Name',
      admin: {
        description: 'e.g., Size, Extras',
      },
    },
    {
      name: 'selection_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
      ],
      label: 'Selection Type',
    },
    {
      name: 'is_required',
      type: 'checkbox',
      defaultValue: false,
      label: 'Is Required',
    },
    {
      name: 'min_selections',
      type: 'number',
      defaultValue: 0,
      label: 'Minimum Selections',
    },
    {
      name: 'max_selections',
      type: 'number',
      label: 'Maximum Selections',
      admin: {
        description: 'Leave empty for unlimited',
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
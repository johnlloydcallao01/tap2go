import { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

export const ProdVariations: CollectionConfig = {
  slug: 'prod-variations',
  labels: {
    singular: 'Product Variation',
    plural: 'Product Variations',
  },
  admin: {
    useAsTitle: 'product_attribute_combo',
    defaultColumns: ['product_attribute_combo', 'product_id', 'attribute_id', 'is_used_for_variations', 'is_visible'],
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
      name: 'product_attribute_combo',
      type: 'text',
      label: 'Product Attribute Combo',
      admin: {
        readOnly: true,
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
  hooks: {
    beforeValidate: [
      async ({ data, req }: { data?: Record<string, unknown>; req: PayloadRequest }) => {
        if (!data) return data
        const d = data as { product_id?: number | { id: number }; attribute_id?: number | { id: number }; product_attribute_combo?: string }
        const productId = typeof d.product_id === 'object' ? d.product_id?.id : d.product_id
        const attributeId = typeof d.attribute_id === 'object' ? d.attribute_id?.id : d.attribute_id
        if (!productId || !attributeId) return data
        try {
          const prodRes = await req.payload.find({ collection: 'products', where: { id: { equals: productId } }, limit: 1 })
          const attrRes = await req.payload.find({ collection: 'prod-attributes', where: { id: { equals: attributeId } }, limit: 1 })
          const prod = prodRes.docs?.[0]
          const attr = attrRes.docs?.[0]
          if (prod && attr) {
            d.product_attribute_combo = `${prod.name} - ${attr.name}`
          }
        } catch {}
        return d
      },
    ],
  },
  timestamps: true,
}

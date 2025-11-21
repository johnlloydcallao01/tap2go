import { CollectionConfig } from 'payload'

export const ProdVariations: CollectionConfig = {
  slug: 'prod-variations',
  labels: {
    singular: 'Product Variation',
    plural: 'Product Variations',
  },
  admin: {
    useAsTitle: 'sku',
    defaultColumns: ['name', 'sku', 'product_id', 'base_price', 'compare_at_price', 'stock_quantity'],
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
      name: 'name',
      type: 'text',
      label: 'Variation Name',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: { description: 'Variation image' },
    },
    {
      name: 'sku',
      type: 'text',
      label: 'SKU',
    },
    {
      name: 'base_price',
      type: 'number',
      label: 'Base Price',
      admin: { step: 0.01 },
    },
    {
      name: 'compare_at_price',
      type: 'number',
      label: 'Compare At Price',
      admin: { step: 0.01 },
    },
    {
      name: 'stock_quantity',
      type: 'number',
      label: 'Stock Quantity',
      defaultValue: 0,
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
    afterChange: [
      async ({ doc, req }) => {
        if (req?.context?.skipSkuUpdate) return
        const productRaw = doc?.product_id as unknown
        const productId =
          typeof productRaw === 'object' && productRaw !== null && 'id' in (productRaw as object)
            ? (productRaw as { id: number | string }).id
            : (productRaw as number | string | undefined)
        if (!productId || !doc?.id) return
        const res = await req.payload.find({ collection: 'products', where: { id: { equals: productId } }, limit: 1 })
        const p = res.docs?.[0]
        const slug = (p?.slug ?? '') as string
        if (!slug) return
        const expected = `${slug}-${String(doc.id)}`.toUpperCase()
        if (doc.sku !== expected) {
          await req.payload.update({
            collection: 'prod-variations',
            id: String(doc.id),
            data: { sku: expected },
            context: { skipSkuUpdate: true },
          })
        }
      },
    ],
  },
  timestamps: true,
}

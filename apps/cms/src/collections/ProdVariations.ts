import { CollectionConfig } from 'payload'
import config from '@payload-config'
import { getPayload } from 'payload'

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
      name: 'short_description',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: 'Brief variation description (max 500 characters)'
      },
      maxLength: 500,
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
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const op = operation
        if (op !== 'create' && op !== 'update') return
        const raw = (data?.product_id ?? undefined) as unknown
        const productId =
          typeof raw === 'object' && raw !== null && 'id' in (raw as object)
            ? (raw as { id: number | string }).id
            : (raw as number | string | undefined)
        if (!productId) return
        try {
          const payload = req?.payload ?? (await getPayload({ config }))
          const res = await payload.find({ collection: 'products', where: { id: { equals: productId } }, limit: 1 })
          const p = res.docs?.[0]
          const slug = (p?.slug ?? '') as string
          if (!slug) return
          const idForSku = op === 'update' ? (originalDoc?.id as number | string | undefined) : (data?.id as number | string | undefined)
          const expected = `${slug}-${String(productId)}-VAR-${String(idForSku ?? '')}`.toUpperCase()
          ;(data as Record<string, unknown>).sku = expected
        } catch {}
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (req?.context?.skipSkuUpdate) return
        if (operation !== 'create') return
        const productRaw = doc?.product_id as unknown
        const productId =
          typeof productRaw === 'object' && productRaw !== null && 'id' in (productRaw as object)
            ? (productRaw as { id: number | string }).id
            : (productRaw as number | string | undefined)
        if (!productId || !doc?.id) return
        try {
          const payload = req?.payload ?? (await getPayload({ config }))
          const res = await payload.find({ collection: 'products', where: { id: { equals: productId } }, limit: 1 })
          const p = res.docs?.[0]
          const slug = (p?.slug ?? '') as string
          if (!slug) return
          const expected = `${slug}-${String(productId)}-VAR-${String(doc.id)}`.toUpperCase()
          doc.sku = expected as unknown as string
          await payload.update({
            collection: 'prod-variations',
            id: String(doc.id),
            data: { sku: expected },
            context: { skipSkuUpdate: true },
          })
        } catch {}
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        const productRaw = doc?.product_id as unknown
        const productId =
          typeof productRaw === 'object' && productRaw !== null && 'id' in (productRaw as object)
            ? (productRaw as { id: number | string }).id
            : (productRaw as number | string | undefined)
        if (!productId || !doc?.id) return
        try {
          const payload = req?.payload ?? (await getPayload({ config }))
          const res = await payload.find({ collection: 'products', where: { id: { equals: productId } }, limit: 1 })
          const p = res.docs?.[0]
          const slug = (p?.slug ?? '') as string
          if (!slug) return
          const expected = `${slug}-${String(productId)}-VAR-${String(doc.id)}`.toUpperCase()
          doc.sku = expected as unknown as string
        } catch {}
      },
    ],
  },
  timestamps: true,
}

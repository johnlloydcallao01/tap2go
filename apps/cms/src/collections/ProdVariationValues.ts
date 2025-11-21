import { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

export const ProdVariationValues: CollectionConfig = {
  slug: 'prod-variation-values',
  labels: {
    singular: 'Product Variation Value',
    plural: 'Product Variation Values',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['variation_id', 'term_id'],
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
      name: 'variation_id',
      type: 'relationship',
      relationTo: 'prod-variations',
      required: true,
      label: 'Product Variation',
      admin: {
        description: 'Select the declared variation (dimension) of the parent variable product',
      },
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
      filterOptions: async ({ siblingData, req }) => {
        const variationRaw = (siblingData as Record<string, unknown> | undefined)?.variation_id as unknown
        const variationId =
          typeof variationRaw === 'object' && variationRaw !== null && 'id' in (variationRaw as object)
            ? (variationRaw as { id: string | number }).id
            : (variationRaw as string | number | undefined)
        if (!variationId) return { attribute_id: { exists: false } }
        try {
          let attrId: number | string | undefined
          if (req?.payload) {
            const pvRes = await req.payload.find({
              collection: 'prod-variations',
              where: { id: { equals: variationId } },
              limit: 1,
            })
            const pv = pvRes.docs?.[0]
            attrId = typeof pv?.attribute_id === 'object' ? pv?.attribute_id?.id : pv?.attribute_id
          }
          return attrId ? { attribute_id: { equals: attrId } } : true
        } catch {
          return true
        }
      },
      validate: async (
        value: unknown,
        { req, data }: { req: PayloadRequest; data?: Record<string, unknown> }
      ) => {
        if (!value) return 'Attribute term is required'
        if (!data || !(data as Record<string, unknown>)?.variation_id) return 'Select a product variation first'
        try {
          const dataRec = data as Record<string, unknown>
          const varRaw = dataRec?.variation_id as unknown
          const varId =
            typeof varRaw === 'object' && varRaw !== null && 'id' in (varRaw as object)
              ? (varRaw as { id: string | number }).id
              : (varRaw as string | number | undefined)
          const pvRes = await req.payload.find({
            collection: 'prod-variations',
            where: { id: { equals: varId } },
            limit: 1,
          })
          const pv = pvRes.docs?.[0]
          if (!pv) return 'Selected product variation does not exist'
          const expectedAttrId = typeof pv.attribute_id === 'object' ? pv.attribute_id.id : pv.attribute_id
          const termRes = await req.payload.find({
            collection: 'prod-attribute-terms',
            where: { id: { equals: value } },
            limit: 1,
          })
          const term = termRes.docs?.[0]
          if (!term) return 'Selected term does not exist'
          const attrId = typeof term.attribute_id === 'object' ? term.attribute_id.id : term.attribute_id
          if (attrId !== expectedAttrId) return 'Term does not belong to the variation’s attribute'
          return true
        } catch {
          return 'Failed to validate selected term'
        }
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }: { data?: Record<string, unknown>; req: PayloadRequest }) => {
        if (!data) return data
        const d = data as { variation_id?: string | number | { id: string | number }; term_id?: string | number | { id: string | number } }
        const variationId =
          typeof d.variation_id === 'object' && d.variation_id !== null && 'id' in (d.variation_id as object)
            ? (d.variation_id as { id: string | number }).id
            : d.variation_id
        if (!variationId) return data
        const pvRes = await req.payload.find({
          collection: 'prod-variations',
          where: { id: { equals: variationId } },
          limit: 1,
        })
        const pv = pvRes.docs?.[0]
        if (!pv) throw new Error('Selected product variation does not exist')
        const expectedAttrId = typeof pv.attribute_id === 'object' ? pv.attribute_id.id : pv.attribute_id
        if (d?.term_id) {
          const termRes = await req.payload.find({
            collection: 'prod-attribute-terms',
            where: {
              id: {
                equals:
                  typeof d.term_id === 'object' && d.term_id !== null && 'id' in (d.term_id as object)
                    ? (d.term_id as { id: string | number }).id
                    : d.term_id,
              },
            },
            limit: 1,
          })
          const term = termRes.docs?.[0]
          const termAttrId = typeof term?.attribute_id === 'object' ? term?.attribute_id?.id : term?.attribute_id
          if (term && termAttrId !== expectedAttrId) throw new Error('Selected term does not belong to the variation’s attribute')
        }
        return d
      },
    ],
  },
  timestamps: true,
}

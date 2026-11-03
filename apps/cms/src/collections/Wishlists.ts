import type { CollectionConfig, RelationshipValue } from 'payload'
import { bustCustomerWishlistCache } from '../utils/dashboardCache'

function getRelationId(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return null
}

export const Wishlists: CollectionConfig = {
  slug: 'wishlists',
  dbName: 'wishlists',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'itemType', 'merchant', 'merchantProduct', 'createdAt'],
    group: 'History',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user.role as string) === 'service' || (user.role as string) === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      return !!user
    },
    update: ({ req: { user } }) => {
      if ((user?.role as string) === 'service' || (user?.role as string) === 'admin') return true
      return { user: { equals: user?.id || '' } }
    },
    delete: ({ req: { user } }) => {
      if ((user?.role as string) === 'service' || (user?.role as string) === 'admin') return true
      return { user: { equals: user?.id || '' } }
    },
  },
  timestamps: true,
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'itemType',
      type: 'select',
      required: true,
      defaultValue: 'merchant',
      options: [
        { label: 'Merchant', value: 'merchant' },
        { label: 'Merchant Product', value: 'merchantProduct' },
      ],
    },
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      admin: {
        condition: (data) => data?.itemType === 'merchant',
      },
      validate: (value: RelationshipValue | null | undefined, options: Record<string, unknown> & { data?: { itemType?: string } }) => {
        if (options.data?.itemType !== 'merchant') return true
        if (Array.isArray(value)) return value.length > 0 ? true : 'Merchant is required'
        return value ? true : 'Merchant is required'
      },
    },
    {
      name: 'merchantProduct',
      type: 'relationship',
      relationTo: 'merchant-products',
      admin: {
        condition: (data) => data?.itemType === 'merchantProduct',
      },
      validate: (value: RelationshipValue | null | undefined, options: Record<string, unknown> & { data?: { itemType?: string } }) => {
        if (options.data?.itemType !== 'merchantProduct') return true
        if (Array.isArray(value)) return value.length > 0 ? true : 'Merchant product is required'
        return value ? true : 'Merchant product is required'
      },
    },
  ],
  indexes: [
    { fields: ['user', 'merchant'], unique: true },
    { fields: ['user', 'merchantProduct'], unique: true },
    { fields: ['user', 'createdAt'] },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        const affectedUsers = new Set(
          [getRelationId(doc.user), getRelationId(previousDoc?.user)].filter(
            (id): id is string | number => id !== null,
          ),
        )
        await Promise.all(Array.from(affectedUsers, bustCustomerWishlistCache))
        return doc
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const userId = getRelationId(doc.user)
        if (userId !== null) await bustCustomerWishlistCache(userId)
        return doc
      },
    ],
    beforeValidate: [
      ({ data, req }) => {
        type MutableData = {
          user?: string | number | { id?: string | number }
        }
        let base: unknown = data
        if (!base && req?.body) {
          base = req.body as unknown
        }
        if (typeof base === 'string') {
          try {
            base = JSON.parse(base) as unknown
          } catch {
            base = {}
          }
        }
        const d = (base || {}) as MutableData
        if (!d.user && req?.user?.id) {
          d.user = req.user.id as number
        }
        return d
      },
    ],
  },
}

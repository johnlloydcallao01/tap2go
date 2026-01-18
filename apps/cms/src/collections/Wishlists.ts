import type { CollectionConfig } from 'payload'

export const Wishlists: CollectionConfig = {
  slug: 'wishlists',
  dbName: 'wishlists',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'merchant', 'createdAt'],
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
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      required: true,
    },
  ],
  indexes: [
    { fields: ['user', 'merchant'], unique: true },
    { fields: ['user', 'createdAt'] },
  ],
  hooks: {
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

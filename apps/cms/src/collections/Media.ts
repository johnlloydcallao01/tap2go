import type { CollectionConfig } from 'payload'
import { bustCustomerHomeCache } from '../utils/dashboardCache'
import { authenticatedUsers, adminOnly } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public read access for media files
    create: authenticatedUsers, // Only authenticated users can upload media
    update: authenticatedUsers, // Only authenticated users can update media
    delete: adminOnly, // Only admins can delete media
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'cloudinaryPublicId', 'cloudinaryURL', 'image'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'image',
      type: 'ui',
      admin: {
        components: {
          Cell: '/components/admin/MediaImageCell',
        },
      },
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          await bustCustomerHomeCache()
        } catch {
          // ignore cache bust failures
        }
      },
    ],
    afterDelete: [
      async () => {
        try {
          await bustCustomerHomeCache()
        } catch {
          // ignore cache bust failures
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/*'],
  },
}

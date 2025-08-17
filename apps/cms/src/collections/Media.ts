import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  upload: {
    staticDir: 'media',
    // Remove imageSizes to only store original images
    // imageSizes: [], // Empty array or remove entirely
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  },
}

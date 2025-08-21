import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      // Allow authenticated users to create media
      return !!user
    },
    update: ({ req: { user } }) => {
      // Allow authenticated users to update media
      return !!user
    },
    delete: ({ req: { user } }) => {
      // Allow authenticated users to delete media
      return !!user
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false, // Make alt text optional for professional flexibility
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

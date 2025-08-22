import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'

export interface CloudinaryAdapterArgs {
  cloudName: string
  apiKey: string
  apiSecret: string
  folder?: string
}

// Interface for document with Cloudinary fields
interface CloudinaryDocument {
  cloudinaryPublicId?: string
  [key: string]: unknown
}

export const cloudinaryAdapter = ({
  cloudName,
  apiKey,
  apiSecret,
  folder = 'uploads',
}: CloudinaryAdapterArgs): Adapter => {
  return ({ collection: _collection, prefix }) => {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    const adapter: GeneratedAdapter = {
      name: 'cloudinary',

      // Handle file upload to Cloudinary
      handleUpload: async ({ file, data }) => {
        try {
          const uploadOptions = {
            folder: prefix ? `${folder}/${prefix}` : folder,
            public_id: file.filename.replace(/\.[^/.]+$/, ''),
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            resource_type: 'auto' as const,
          }

          const result: UploadApiResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              uploadOptions,
              (error, result) => {
                if (error) reject(error)
                else resolve(result!)
              }
            )
            
            uploadStream.end(file.buffer)
          })

          // Update data with Cloudinary information
          data.cloudinaryPublicId = result.public_id
          data.cloudinaryURL = result.secure_url

          // CRITICAL: Set the url field to the Cloudinary URL
          data.url = result.secure_url

          // Store the Cloudinary public_id as filename for generateURL to work
          data.filename = result.public_id
          data.filesize = result.bytes
          data.width = result.width
          data.height = result.height
          data.mimeType = `${result.resource_type}/${result.format}`

          // Ensure thumbnailURL also points to Cloudinary for consistency
          if (result.resource_type === 'image') {
            data.thumbnailURL = cloudinary.url(result.public_id, {
              secure: true,
              fetch_format: 'auto',
              quality: 'auto',
              width: 300,
              height: 300,
              crop: 'fill'
            })
          }


        } catch (error) {
          console.error('Cloudinary upload error:', error)
          throw error
        }
      },

      // Handle file deletion
      handleDelete: async ({ doc, filename }) => {
        try {
          const cloudinaryDoc = doc as unknown as CloudinaryDocument
          const publicId = cloudinaryDoc.cloudinaryPublicId || filename

          if (!publicId) {
            throw new Error('No Cloudinary public ID found for deletion')
          }

          const result = await cloudinary.uploader.destroy(publicId)

          if (result.result !== 'ok' && result.result !== 'not found') {
            throw new Error(`Cloudinary deletion failed: ${result.result}`)
          }

        } catch (error) {
          console.error('Cloudinary delete error:', error)
          throw error
        }
      },

      // Generate URL for file - Returns direct Cloudinary URL for enterprise performance
      generateURL: ({ filename }) => {
        return cloudinary.url(filename, {
          secure: true,
          fetch_format: 'auto',
          quality: 'auto',
          flags: 'progressive',
        })
      },

      // Handle static file requests
      staticHandler: async (_req, { params }) => {
        const { filename } = params
        const cloudinaryURL = cloudinary.url(filename, {
          secure: true,
          fetch_format: 'auto',
          quality: 'auto',
        })
        
        return Response.redirect(cloudinaryURL, 302)
      },

      // Additional fields for Cloudinary metadata
      fields: [
        {
          name: 'cloudinaryPublicId',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'cloudinaryURL',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    }

    return adapter
  }
}

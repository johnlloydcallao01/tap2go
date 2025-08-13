// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import dotenv from 'dotenv'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Restaurants } from './collections/Restaurants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load env from app-level first, then fall back to monorepo root
dotenv.config({ path: path.resolve(dirname, '../.env') })
dotenv.config({ path: path.resolve(dirname, '../.env.local') })
dotenv.config({ path: path.resolve(dirname, '../../../.env.local') })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Restaurants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl: process.env.DATABASE_URI?.includes('supabase') ? {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
      } : false,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})

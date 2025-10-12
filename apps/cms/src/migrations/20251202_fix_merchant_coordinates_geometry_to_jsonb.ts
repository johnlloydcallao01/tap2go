import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * MERCHANT COORDINATES GEOMETRY TO JSONB CONVERSION
 * 
 * This migration safely converts the merchant_coordinates column from PostGIS geometry
 * to jsonb format as expected by PayloadCMS. The error occurs because PayloadCMS
 * expects jsonb but the database has geometry type.
 * 
 * Steps:
 * 1. Create temporary jsonb column
 * 2. Convert existing geometry data to GeoJSON format
 * 3. Drop the old geometry column
 * 4. Rename temp column to merchant_coordinates
 */

export async function up({ payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🔄 Converting merchant_coordinates from geometry to jsonb...')

  // Step 1: Create a temporary column to store the converted coordinates
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN IF NOT EXISTS "merchant_coordinates_temp" jsonb;
  `)

  // Step 2: Convert existing PostGIS geometry data to GeoJSON format
  // This handles the conversion that PostgreSQL can't do automatically
  await payload.db.drizzle.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = ST_AsGeoJSON("merchant_coordinates")::jsonb
    WHERE "merchant_coordinates" IS NOT NULL;
  `)

  // Step 3: Drop the spatial index first (if it exists)
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "merchants_coordinates_gist_idx";
  `)

  // Step 4: Drop the old geometry column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    DROP COLUMN IF EXISTS "merchant_coordinates";
  `)

  // Step 5: Rename the temporary column to merchant_coordinates
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    RENAME COLUMN "merchant_coordinates_temp" TO "merchant_coordinates";
  `)

  console.log('✅ Successfully converted merchant_coordinates to jsonb format')
}

export async function down({ payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting merchant_coordinates from jsonb to geometry...')

  // Step 1: Create a temporary geometry column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN IF NOT EXISTS "merchant_coordinates_temp" geometry(POINT, 4326);
  `)

  // Step 2: Convert jsonb GeoJSON back to PostGIS geometry
  await payload.db.drizzle.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = ST_GeomFromGeoJSON("merchant_coordinates"::text)
    WHERE "merchant_coordinates" IS NOT NULL;
  `)

  // Step 3: Drop the jsonb column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    DROP COLUMN IF EXISTS "merchant_coordinates";
  `)

  // Step 4: Rename the temporary column back
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    RENAME COLUMN "merchant_coordinates_temp" TO "merchant_coordinates";
  `)

  // Step 5: Recreate the spatial index
  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "merchants_coordinates_gist_idx" 
    ON "merchants" USING gist ("merchant_coordinates");
  `)

  console.log('✅ Successfully reverted merchant_coordinates to geometry format')
}
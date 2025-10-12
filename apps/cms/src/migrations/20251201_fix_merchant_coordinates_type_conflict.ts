import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Step 1: Create a temporary column to store the converted coordinates
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN IF NOT EXISTS "merchant_coordinates_temp" jsonb;
  `)

  // Step 2: Convert existing PostGIS geometry data to jsonb format
  // Extract latitude and longitude from the geometry and store as JSON
  await payload.db.drizzle.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = json_build_object(
      'type', 'Point',
      'coordinates', ARRAY[ST_X("merchant_coordinates"), ST_Y("merchant_coordinates")]
    )::jsonb
    WHERE "merchant_coordinates" IS NOT NULL;
  `)

  // Step 3: Drop the spatial index first
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

  // Step 6: Handle other geometry columns that might conflict with PayloadCMS json fields
  // Convert service_area_geometry to jsonb if it exists
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'merchants' 
                 AND column_name = 'service_area_geometry') THEN
        
        -- Add temp column
        ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "service_area_geometry_temp" jsonb;
        
        -- Convert geometry to GeoJSON
        UPDATE "merchants" 
        SET "service_area_geometry_temp" = ST_AsGeoJSON("service_area_geometry")::jsonb
        WHERE "service_area_geometry" IS NOT NULL;
        
        -- Drop spatial index and column
        DROP INDEX IF EXISTS "merchants_service_area_geometry_gist_idx";
        ALTER TABLE "merchants" DROP COLUMN "service_area_geometry";
        
        -- Rename temp column
        ALTER TABLE "merchants" RENAME COLUMN "service_area_geometry_temp" TO "service_area_geometry";
      END IF;
    END $$;
  `)

  // Step 7: Convert priority_zones_geometry to jsonb if it exists
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'merchants' 
                 AND column_name = 'priority_zones_geometry') THEN
        
        -- Add temp column
        ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "priority_zones_geometry_temp" jsonb;
        
        -- Convert geometry to GeoJSON
        UPDATE "merchants" 
        SET "priority_zones_geometry_temp" = ST_AsGeoJSON("priority_zones_geometry")::jsonb
        WHERE "priority_zones_geometry" IS NOT NULL;
        
        -- Drop spatial index and column
        DROP INDEX IF EXISTS "merchants_priority_zones_geometry_gist_idx";
        ALTER TABLE "merchants" DROP COLUMN "priority_zones_geometry";
        
        -- Rename temp column
        ALTER TABLE "merchants" RENAME COLUMN "priority_zones_geometry_temp" TO "priority_zones_geometry";
      END IF;
    END $$;
  `)

  // Step 8: Convert restricted_areas_geometry to jsonb if it exists
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'merchants' 
                 AND column_name = 'restricted_areas_geometry') THEN
        
        -- Add temp column
        ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "restricted_areas_geometry_temp" jsonb;
        
        -- Convert geometry to GeoJSON
        UPDATE "merchants" 
        SET "restricted_areas_geometry_temp" = ST_AsGeoJSON("restricted_areas_geometry")::jsonb
        WHERE "restricted_areas_geometry" IS NOT NULL;
        
        -- Drop spatial index and column
        DROP INDEX IF EXISTS "merchants_restricted_areas_geometry_gist_idx";
        ALTER TABLE "merchants" DROP COLUMN "restricted_areas_geometry";
        
        -- Rename temp column
        ALTER TABLE "merchants" RENAME COLUMN "restricted_areas_geometry_temp" TO "restricted_areas_geometry";
      END IF;
    END $$;
  `)
}

export async function down({ payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Step 1: Create temporary geometry column for merchant_coordinates
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN IF NOT EXISTS "merchant_coordinates_temp" geometry(POINT, 4326);
  `)

  // Step 2: Convert jsonb back to PostGIS geometry
  await payload.db.drizzle.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = ST_SetSRID(
      ST_MakePoint(
        ("merchant_coordinates"->'coordinates'->>0)::double precision,
        ("merchant_coordinates"->'coordinates'->>1)::double precision
      ), 4326
    )
    WHERE "merchant_coordinates" IS NOT NULL 
      AND "merchant_coordinates"->>'type' = 'Point';
  `)

  // Step 3: Drop the jsonb column and rename temp column
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "merchant_coordinates";
    ALTER TABLE "merchants" RENAME COLUMN "merchant_coordinates_temp" TO "merchant_coordinates";
  `)

  // Step 4: Recreate spatial index
  await payload.db.drizzle.execute(sql`
    CREATE INDEX IF NOT EXISTS "merchants_coordinates_gist_idx" 
    ON "merchants" USING gist ("merchant_coordinates");
  `)

  // Note: Reverting other geometry columns would be complex and is not implemented
  // as this migration is primarily to fix the immediate type conflict issue
}
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Add PostGIS geometry columns to merchants table
  await payload.db.drizzle.execute(sql`
    -- Add PostGIS geometry columns for merchants
    ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "merchant_coordinates" geometry(POINT, 4326);
    ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "service_area_geometry" geometry(POLYGON, 4326);
    ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "priority_zones_geometry" geometry(MULTIPOLYGON, 4326);
    ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "restricted_areas_geometry" geometry(MULTIPOLYGON, 4326);
    ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "delivery_zones_geometry" geometry(MULTIPOLYGON, 4326);
  `)

  // Create spatial indexes for performance
  await payload.db.drizzle.execute(sql`
    -- Create spatial indexes
    CREATE INDEX IF NOT EXISTS "merchants_coordinates_gist_idx" ON "merchants" USING gist ("merchant_coordinates");
    CREATE INDEX IF NOT EXISTS "merchants_service_area_geometry_gist_idx" ON "merchants" USING gist ("service_area_geometry");
    CREATE INDEX IF NOT EXISTS "merchants_priority_zones_geometry_gist_idx" ON "merchants" USING gist ("priority_zones_geometry");
    CREATE INDEX IF NOT EXISTS "merchants_restricted_areas_geometry_gist_idx" ON "merchants" USING gist ("restricted_areas_geometry");
    CREATE INDEX IF NOT EXISTS "merchants_delivery_zones_geometry_gist_idx" ON "merchants" USING gist ("delivery_zones_geometry");
  `)

  // Populate geometry columns from existing latitude/longitude data
  await payload.db.drizzle.execute(sql`
    -- Update merchant_coordinates from existing lat/lng data
    UPDATE "merchants" 
    SET "merchant_coordinates" = ST_SetSRID(ST_MakePoint("merchant_longitude", "merchant_latitude"), 4326)
    WHERE "merchant_latitude" IS NOT NULL 
      AND "merchant_longitude" IS NOT NULL 
      AND "merchant_coordinates" IS NULL;
  `)

  // Convert existing JSONB service areas to PostGIS geometry if they exist
  await payload.db.drizzle.execute(sql`
    -- Convert service_area JSONB to PostGIS geometry
    UPDATE "merchants" 
    SET "service_area_geometry" = ST_GeomFromGeoJSON("service_area"::text)
    WHERE "service_area" IS NOT NULL 
      AND "service_area_geometry" IS NULL
      AND jsonb_typeof("service_area") = 'object';
  `)

  await payload.db.drizzle.execute(sql`
    -- Convert priority_zones JSONB to PostGIS geometry
    UPDATE "merchants" 
    SET "priority_zones_geometry" = ST_GeomFromGeoJSON("priority_zones"::text)
    WHERE "priority_zones" IS NOT NULL 
      AND "priority_zones_geometry" IS NULL
      AND jsonb_typeof("priority_zones") = 'object';
  `)

  await payload.db.drizzle.execute(sql`
    -- Convert restricted_areas JSONB to PostGIS geometry
    UPDATE "merchants" 
    SET "restricted_areas_geometry" = ST_GeomFromGeoJSON("restricted_areas"::text)
    WHERE "restricted_areas" IS NOT NULL 
      AND "restricted_areas_geometry" IS NULL
      AND jsonb_typeof("restricted_areas") = 'object';
  `)

  await payload.db.drizzle.execute(sql`
    -- Convert delivery_zones JSONB to PostGIS geometry
    UPDATE "merchants" 
    SET "delivery_zones_geometry" = ST_GeomFromGeoJSON("delivery_zones"::text)
    WHERE "delivery_zones" IS NOT NULL 
      AND "delivery_zones_geometry" IS NULL
      AND jsonb_typeof("delivery_zones") = 'object';
  `)
}

export async function down({ payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Drop spatial indexes
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "merchants_coordinates_gist_idx";
    DROP INDEX IF EXISTS "merchants_service_area_geometry_gist_idx";
    DROP INDEX IF EXISTS "merchants_priority_zones_geometry_gist_idx";
    DROP INDEX IF EXISTS "merchants_restricted_areas_geometry_gist_idx";
    DROP INDEX IF EXISTS "merchants_delivery_zones_geometry_gist_idx";
  `)

  // Drop PostGIS geometry columns
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "merchant_coordinates";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "service_area_geometry";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "priority_zones_geometry";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "restricted_areas_geometry";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "delivery_zones_geometry";
  `)
}
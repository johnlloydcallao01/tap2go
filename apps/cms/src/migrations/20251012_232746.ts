import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // First, add a temporary column for the geometry data
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN "merchant_coordinates_temp" geometry(Point, 4326);`)
  
  // Convert existing JSONB data to PostGIS geometry in the temp column
  await db.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = ST_GeomFromGeoJSON("merchant_coordinates"::text)
    WHERE "merchant_coordinates" IS NOT NULL;`)
  
  // Drop the old JSONB column
  await db.execute(sql`
    ALTER TABLE "merchants" 
    DROP COLUMN "merchant_coordinates";`)
  
  // Rename the temp column to the original name
  await db.execute(sql`
    ALTER TABLE "merchants" 
    RENAME COLUMN "merchant_coordinates_temp" TO "merchant_coordinates";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Add a temporary JSONB column
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ADD COLUMN "merchant_coordinates_temp" jsonb;`)
  
  // Convert geometry back to JSONB in the temp column
  await db.execute(sql`
    UPDATE "merchants" 
    SET "merchant_coordinates_temp" = ST_AsGeoJSON("merchant_coordinates")::jsonb
    WHERE "merchant_coordinates" IS NOT NULL;`)
  
  // Drop the geometry column
  await db.execute(sql`
    ALTER TABLE "merchants" 
    DROP COLUMN "merchant_coordinates";`)
  
  // Rename the temp column to the original name
  await db.execute(sql`
    ALTER TABLE "merchants" 
    RENAME COLUMN "merchant_coordinates_temp" TO "merchant_coordinates";`)
}

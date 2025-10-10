import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First, create a temporary column to store the converted coordinates
  await db.execute(sql`
    ALTER TABLE "addresses" 
    ADD COLUMN "coordinates_temp" jsonb;
  `)

  // Convert existing PostGIS geometry data to jsonb format
  // Extract latitude and longitude from the geometry and store as JSON
  await db.execute(sql`
    UPDATE "addresses" 
    SET "coordinates_temp" = json_build_object(
      'lat', ST_Y("coordinates"),
      'lng', ST_X("coordinates")
    )::jsonb
    WHERE "coordinates" IS NOT NULL;
  `)

  // Drop the old geometry column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    DROP COLUMN "coordinates";
  `)

  // Rename the temporary column to coordinates
  await db.execute(sql`
    ALTER TABLE "addresses" 
    RENAME COLUMN "coordinates_temp" TO "coordinates";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Create a temporary geometry column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    ADD COLUMN "coordinates_temp" geometry(Point, 4326);
  `)

  // Convert jsonb back to PostGIS geometry
  await db.execute(sql`
    UPDATE "addresses" 
    SET "coordinates_temp" = ST_SetSRID(
      ST_MakePoint(
        ("coordinates"->>'lng')::double precision,
        ("coordinates"->>'lat')::double precision
      ), 4326
    )
    WHERE "coordinates" IS NOT NULL;
  `)

  // Drop the jsonb column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    DROP COLUMN "coordinates";
  `)

  // Rename the geometry column back
  await db.execute(sql`
    ALTER TABLE "addresses" 
    RENAME COLUMN "coordinates_temp" TO "coordinates";
  `)
}
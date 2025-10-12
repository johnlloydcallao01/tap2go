import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Convert delivery_zones_geometry from PostGIS geometry to jsonb
  await db.execute(sql`
    -- Create temporary column for delivery_zones_geometry
    ALTER TABLE "merchants" ADD COLUMN "delivery_zones_geometry_temp" jsonb;
  `)

  // Convert existing PostGIS geometry data to GeoJSON format
  await db.execute(sql`
    UPDATE "merchants" 
    SET "delivery_zones_geometry_temp" = ST_AsGeoJSON("delivery_zones_geometry")::jsonb
    WHERE "delivery_zones_geometry" IS NOT NULL;
  `)

  // Drop the old PostGIS geometry column
  await db.execute(sql`
    ALTER TABLE "merchants" DROP COLUMN "delivery_zones_geometry";
  `)

  // Rename the temporary column to the original name
  await db.execute(sql`
    ALTER TABLE "merchants" RENAME COLUMN "delivery_zones_geometry_temp" TO "delivery_zones_geometry";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Convert delivery_zones_geometry from jsonb back to PostGIS geometry
  await db.execute(sql`
    -- Create temporary PostGIS geometry column
    ALTER TABLE "merchants" ADD COLUMN "delivery_zones_geometry_temp" GEOMETRY(MULTIPOLYGON, 4326);
  `)

  // Convert existing GeoJSON data back to PostGIS geometry
  await db.execute(sql`
    UPDATE "merchants" 
    SET "delivery_zones_geometry_temp" = ST_GeomFromGeoJSON("delivery_zones_geometry"::text)
    WHERE "delivery_zones_geometry" IS NOT NULL;
  `)

  // Drop the jsonb column
  await db.execute(sql`
    ALTER TABLE "merchants" DROP COLUMN "delivery_zones_geometry";
  `)

  // Rename the temporary column to the original name
  await db.execute(sql`
    ALTER TABLE "merchants" RENAME COLUMN "delivery_zones_geometry_temp" TO "delivery_zones_geometry";
  `)

  // Recreate the spatial index
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "merchants_delivery_zones_geometry_gist_idx" ON "merchants" USING gist ("delivery_zones_geometry");
  `)
}

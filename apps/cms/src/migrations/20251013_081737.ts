import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Convert geometry columns to JSONB with proper USING clauses
  
  // merchant_coordinates is already JSONB, skip it
  
  // Convert other geometry columns to JSONB using ST_AsGeoJSON
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "service_area_geometry" 
    SET DATA TYPE jsonb 
    USING CASE 
      WHEN "service_area_geometry" IS NULL THEN NULL 
      ELSE ST_AsGeoJSON("service_area_geometry")::jsonb 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "priority_zones_geometry" 
    SET DATA TYPE jsonb 
    USING CASE 
      WHEN "priority_zones_geometry" IS NULL THEN NULL 
      ELSE ST_AsGeoJSON("priority_zones_geometry")::jsonb 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "restricted_areas_geometry" 
    SET DATA TYPE jsonb 
    USING CASE 
      WHEN "restricted_areas_geometry" IS NULL THEN NULL 
      ELSE ST_AsGeoJSON("restricted_areas_geometry")::jsonb 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "delivery_zones_geometry" 
    SET DATA TYPE jsonb 
    USING CASE 
      WHEN "delivery_zones_geometry" IS NULL THEN NULL 
      ELSE ST_AsGeoJSON("delivery_zones_geometry")::jsonb 
    END;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Convert JSONB back to geometry columns
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "service_area_geometry" 
    SET DATA TYPE geometry(POLYGON, 4326) 
    USING CASE 
      WHEN "service_area_geometry" IS NULL THEN NULL 
      ELSE ST_GeomFromGeoJSON("service_area_geometry"::text) 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "priority_zones_geometry" 
    SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
    USING CASE 
      WHEN "priority_zones_geometry" IS NULL THEN NULL 
      ELSE ST_GeomFromGeoJSON("priority_zones_geometry"::text) 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "restricted_areas_geometry" 
    SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
    USING CASE 
      WHEN "restricted_areas_geometry" IS NULL THEN NULL 
      ELSE ST_GeomFromGeoJSON("restricted_areas_geometry"::text) 
    END;
  `)
  
  await db.execute(sql`
    ALTER TABLE "merchants" 
    ALTER COLUMN "delivery_zones_geometry" 
    SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
    USING CASE 
      WHEN "delivery_zones_geometry" IS NULL THEN NULL 
      ELSE ST_GeomFromGeoJSON("delivery_zones_geometry"::text) 
    END;
  `)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Convert service_area_geometry from JSONB to geometry(Polygon, 4326)
    ALTER TABLE merchants ADD COLUMN service_area_geometry_temp geometry(Polygon, 4326);
    
    -- Convert existing JSONB data to PostGIS geometry for service_area_geometry
    UPDATE merchants 
    SET service_area_geometry_temp = ST_GeomFromGeoJSON(service_area_geometry::text)
    WHERE service_area_geometry IS NOT NULL 
    AND service_area_geometry != 'null'::jsonb
    AND service_area_geometry::text != 'null';
    
    -- Drop old JSONB column and rename temp column
    ALTER TABLE merchants DROP COLUMN service_area_geometry;
    ALTER TABLE merchants RENAME COLUMN service_area_geometry_temp TO service_area_geometry;
    
    -- Convert priority_zones_geometry from JSONB to geometry(MultiPolygon, 4326)
    ALTER TABLE merchants ADD COLUMN priority_zones_geometry_temp geometry(MultiPolygon, 4326);
    
    -- Convert existing JSONB data to PostGIS geometry for priority_zones_geometry
    UPDATE merchants 
    SET priority_zones_geometry_temp = ST_GeomFromGeoJSON(priority_zones_geometry::text)
    WHERE priority_zones_geometry IS NOT NULL 
    AND priority_zones_geometry != 'null'::jsonb
    AND priority_zones_geometry::text != 'null';
    
    -- Drop old JSONB column and rename temp column
    ALTER TABLE merchants DROP COLUMN priority_zones_geometry;
    ALTER TABLE merchants RENAME COLUMN priority_zones_geometry_temp TO priority_zones_geometry;
    
    -- Convert restricted_areas_geometry from JSONB to geometry(MultiPolygon, 4326)
    ALTER TABLE merchants ADD COLUMN restricted_areas_geometry_temp geometry(MultiPolygon, 4326);
    
    -- Convert existing JSONB data to PostGIS geometry for restricted_areas_geometry
    UPDATE merchants 
    SET restricted_areas_geometry_temp = ST_GeomFromGeoJSON(restricted_areas_geometry::text)
    WHERE restricted_areas_geometry IS NOT NULL 
    AND restricted_areas_geometry != 'null'::jsonb
    AND restricted_areas_geometry::text != 'null';
    
    -- Drop old JSONB column and rename temp column
    ALTER TABLE merchants DROP COLUMN restricted_areas_geometry;
    ALTER TABLE merchants RENAME COLUMN restricted_areas_geometry_temp TO restricted_areas_geometry;
    
    -- Convert delivery_zones_geometry from JSONB to geometry(MultiPolygon, 4326)
    ALTER TABLE merchants ADD COLUMN delivery_zones_geometry_temp geometry(MultiPolygon, 4326);
    
    -- Convert existing JSONB data to PostGIS geometry for delivery_zones_geometry
    UPDATE merchants 
    SET delivery_zones_geometry_temp = ST_GeomFromGeoJSON(delivery_zones_geometry::text)
    WHERE delivery_zones_geometry IS NOT NULL 
    AND delivery_zones_geometry != 'null'::jsonb
    AND delivery_zones_geometry::text != 'null';
    
    -- Drop old JSONB column and rename temp column
    ALTER TABLE merchants DROP COLUMN delivery_zones_geometry;
    ALTER TABLE merchants RENAME COLUMN delivery_zones_geometry_temp TO delivery_zones_geometry;
    
    -- Create spatial indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_merchants_service_area_geometry ON merchants USING GIST (service_area_geometry);
    CREATE INDEX IF NOT EXISTS idx_merchants_priority_zones_geometry ON merchants USING GIST (priority_zones_geometry);
    CREATE INDEX IF NOT EXISTS idx_merchants_restricted_areas_geometry ON merchants USING GIST (restricted_areas_geometry);
    CREATE INDEX IF NOT EXISTS idx_merchants_delivery_zones_geometry ON merchants USING GIST (delivery_zones_geometry);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop spatial indexes
    DROP INDEX IF EXISTS idx_merchants_service_area_geometry;
    DROP INDEX IF EXISTS idx_merchants_priority_zones_geometry;
    DROP INDEX IF EXISTS idx_merchants_restricted_areas_geometry;
    DROP INDEX IF EXISTS idx_merchants_delivery_zones_geometry;
    
    -- Convert service_area_geometry back to JSONB
    ALTER TABLE merchants ADD COLUMN service_area_geometry_temp jsonb;
    
    UPDATE merchants 
    SET service_area_geometry_temp = ST_AsGeoJSON(service_area_geometry)::jsonb
    WHERE service_area_geometry IS NOT NULL;
    
    ALTER TABLE merchants DROP COLUMN service_area_geometry;
    ALTER TABLE merchants RENAME COLUMN service_area_geometry_temp TO service_area_geometry;
    
    -- Convert priority_zones_geometry back to JSONB
    ALTER TABLE merchants ADD COLUMN priority_zones_geometry_temp jsonb;
    
    UPDATE merchants 
    SET priority_zones_geometry_temp = ST_AsGeoJSON(priority_zones_geometry)::jsonb
    WHERE priority_zones_geometry IS NOT NULL;
    
    ALTER TABLE merchants DROP COLUMN priority_zones_geometry;
    ALTER TABLE merchants RENAME COLUMN priority_zones_geometry_temp TO priority_zones_geometry;
    
    -- Convert restricted_areas_geometry back to JSONB
    ALTER TABLE merchants ADD COLUMN restricted_areas_geometry_temp jsonb;
    
    UPDATE merchants 
    SET restricted_areas_geometry_temp = ST_AsGeoJSON(restricted_areas_geometry)::jsonb
    WHERE restricted_areas_geometry IS NOT NULL;
    
    ALTER TABLE merchants DROP COLUMN restricted_areas_geometry;
    ALTER TABLE merchants RENAME COLUMN restricted_areas_geometry_temp TO restricted_areas_geometry;
    
    -- Convert delivery_zones_geometry back to JSONB
    ALTER TABLE merchants ADD COLUMN delivery_zones_geometry_temp jsonb;
    
    UPDATE merchants 
    SET delivery_zones_geometry_temp = ST_AsGeoJSON(delivery_zones_geometry)::jsonb
    WHERE delivery_zones_geometry IS NOT NULL;
    
    ALTER TABLE merchants DROP COLUMN delivery_zones_geometry;
    ALTER TABLE merchants RENAME COLUMN delivery_zones_geometry_temp TO delivery_zones_geometry;
  `)
}
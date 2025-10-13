import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Convert merchant_coordinates from PostGIS geometry to JSONB GeoJSON format
    await db.execute(sql`
        -- First, add a temporary column for the new JSONB data
        ALTER TABLE merchants ADD COLUMN merchant_coordinates_temp JSONB;
        
        -- Convert existing PostGIS geometry to GeoJSON format
        UPDATE merchants 
        SET merchant_coordinates_temp = ST_AsGeoJSON(merchant_coordinates)::jsonb
        WHERE merchant_coordinates IS NOT NULL;
        
        -- Drop the old geometry column
        ALTER TABLE merchants DROP COLUMN merchant_coordinates;
        
        -- Rename the temp column to the original name
        ALTER TABLE merchants RENAME COLUMN merchant_coordinates_temp TO merchant_coordinates;
    `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Convert back from JSONB GeoJSON to PostGIS geometry
    await db.execute(sql`
        -- Add temporary geometry column
        ALTER TABLE merchants ADD COLUMN merchant_coordinates_temp GEOMETRY(POINT, 4326);
        
        -- Convert JSONB GeoJSON back to PostGIS geometry
        UPDATE merchants 
        SET merchant_coordinates_temp = ST_GeomFromGeoJSON(merchant_coordinates::text)
        WHERE merchant_coordinates IS NOT NULL;
        
        -- Drop the JSONB column
        ALTER TABLE merchants DROP COLUMN merchant_coordinates;
        
        -- Rename temp column back
        ALTER TABLE merchants RENAME COLUMN merchant_coordinates_temp TO merchant_coordinates;
    `)
}

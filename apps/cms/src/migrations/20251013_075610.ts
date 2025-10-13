import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    // Convert merchant_coordinates from JSONB GeoJSON back to PostGIS geometry
    await db.execute(sql`
        -- Convert JSONB GeoJSON to PostGIS geometry using ST_GeomFromGeoJSON
        ALTER TABLE merchants 
        ALTER COLUMN merchant_coordinates 
        SET DATA TYPE geometry(POINT, 4326) 
        USING ST_GeomFromGeoJSON(merchant_coordinates::text);
    `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Convert back from PostGIS geometry to JSONB GeoJSON
    await db.execute(sql`
        -- Convert PostGIS geometry back to JSONB GeoJSON
        ALTER TABLE merchants 
        ALTER COLUMN merchant_coordinates 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(merchant_coordinates)::jsonb;
    `)
}

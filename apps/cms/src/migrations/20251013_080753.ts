import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    // Convert PostGIS geometry back to JSONB GeoJSON format
    await db.execute(sql`
        -- Convert PostGIS geometry to JSONB GeoJSON
        ALTER TABLE merchants 
        ALTER COLUMN merchant_coordinates 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(merchant_coordinates)::jsonb;
    `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // Convert JSONB GeoJSON back to PostGIS geometry
    await db.execute(sql`
        -- Convert JSONB GeoJSON back to PostGIS geometry
        ALTER TABLE merchants 
        ALTER COLUMN merchant_coordinates 
        SET DATA TYPE geometry(POINT, 4326) 
        USING ST_GeomFromGeoJSON(merchant_coordinates::text);
    `)
}

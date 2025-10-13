import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    console.log('🔄 Converting merchant_coordinates from PostGIS geometry to JSONB GeoJSON...')
    
    // Convert PostGIS geometry to JSONB GeoJSON format
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates = ST_AsGeoJSON(merchant_coordinates)::jsonb
        WHERE merchant_coordinates IS NOT NULL;
    `)
    
    console.log('✅ Successfully converted merchant_coordinates to JSONB GeoJSON format')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    console.log('🔄 Converting merchant_coordinates from JSONB GeoJSON back to PostGIS geometry...')
    
    // Convert JSONB GeoJSON back to PostGIS geometry
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates = ST_GeomFromGeoJSON(merchant_coordinates::text)
        WHERE merchant_coordinates IS NOT NULL;
    `)
    
    console.log('✅ Successfully converted merchant_coordinates back to PostGIS geometry')
}

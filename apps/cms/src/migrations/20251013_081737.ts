import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    console.log('🔄 Converting geometry columns to JSONB...')
    
    // Convert service_area_geometry from geometry to JSONB
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN service_area_geometry 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(service_area_geometry)::jsonb;
    `)
    
    // Convert priority_zones_geometry from geometry to JSONB
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN priority_zones_geometry 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(priority_zones_geometry)::jsonb;
    `)
    
    // Convert restricted_areas_geometry from geometry to JSONB
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN restricted_areas_geometry 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(restricted_areas_geometry)::jsonb;
    `)
    
    // Convert delivery_zones_geometry from geometry to JSONB
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN delivery_zones_geometry 
        SET DATA TYPE jsonb 
        USING ST_AsGeoJSON(delivery_zones_geometry)::jsonb;
    `)
    
    console.log('✅ Successfully converted all geometry columns to JSONB')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    console.log('🔄 Converting JSONB columns back to geometry...')
    
    // Convert service_area_geometry from JSONB back to geometry
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN service_area_geometry 
        SET DATA TYPE geometry(POLYGON, 4326) 
        USING ST_GeomFromGeoJSON(service_area_geometry::text);
    `)
    
    // Convert priority_zones_geometry from JSONB back to geometry
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN priority_zones_geometry 
        SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
        USING ST_GeomFromGeoJSON(priority_zones_geometry::text);
    `)
    
    // Convert restricted_areas_geometry from JSONB back to geometry
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN restricted_areas_geometry 
        SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
        USING ST_GeomFromGeoJSON(restricted_areas_geometry::text);
    `)
    
    // Convert delivery_zones_geometry from JSONB back to geometry
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN delivery_zones_geometry 
        SET DATA TYPE geometry(MULTIPOLYGON, 4326) 
        USING ST_GeomFromGeoJSON(delivery_zones_geometry::text);
    `)
    
    console.log('✅ Successfully converted all JSONB columns back to geometry')
}

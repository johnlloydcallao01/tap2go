import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Convert merchant_coordinates from JSONB back to PostGIS geometry
    await db.execute(sql`
        ALTER TABLE merchants 
        ADD COLUMN IF NOT EXISTS merchant_coordinates_geometry GEOMETRY(POINT, 4326);
    `)
    
    // Convert existing JSONB coordinates to PostGIS geometry
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates_geometry = ST_SetSRID(
            ST_MakePoint(
                (merchant_coordinates->'coordinates'->>0)::double precision,
                (merchant_coordinates->'coordinates'->>1)::double precision
            ), 4326
        )
        WHERE merchant_coordinates IS NOT NULL 
            AND merchant_coordinates->>'type' = 'Point';
    `)
    
    // Drop the old JSONB column and rename the geometry column
    await db.execute(sql`
        ALTER TABLE merchants DROP COLUMN IF EXISTS merchant_coordinates;
    `)
    
    await db.execute(sql`
        ALTER TABLE merchants RENAME COLUMN merchant_coordinates_geometry TO merchant_coordinates;
    `)
    
    // Create spatial index for PostGIS performance
    await db.execute(sql`
        CREATE INDEX IF NOT EXISTS merchants_coordinates_gist_idx 
        ON merchants USING gist (merchant_coordinates);
    `)
    
    console.log('✅ Merchant coordinates converted back to PostGIS geometry');
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Convert back to JSONB
    await db.execute(sql`
        ALTER TABLE merchants 
        ADD COLUMN IF NOT EXISTS merchant_coordinates_jsonb JSONB;
    `)
    
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates_jsonb = json_build_object(
            'type', 'Point',
            'coordinates', ARRAY[ST_X(merchant_coordinates), ST_Y(merchant_coordinates)]
        )::jsonb
        WHERE merchant_coordinates IS NOT NULL;
    `)
    
    await db.execute(sql`
        DROP INDEX IF EXISTS merchants_coordinates_gist_idx;
    `)
    
    await db.execute(sql`
        ALTER TABLE merchants DROP COLUMN merchant_coordinates;
    `)
    
    await db.execute(sql`
        ALTER TABLE merchants RENAME COLUMN merchant_coordinates_jsonb TO merchant_coordinates;
    `)
    
    console.log('✅ Merchant coordinates converted back to JSONB');
}

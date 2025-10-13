import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    console.log('🔄 Synchronizing merchant_coordinates with merchant_latitude/longitude...')
    
    // Step 1: Update merchant_coordinates JSONB to match merchant_latitude/longitude
    // Only update records that have valid numeric coordinates
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates = jsonb_build_object(
            'type', 'Point',
            'coordinates', jsonb_build_array(
                merchant_longitude,
                merchant_latitude
            )
        )
        WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL
        AND merchant_latitude != 0
        AND merchant_longitude != 0;
    `)
    
    console.log('✅ Updated merchant_coordinates to match lat/lng values')
    
    // Step 2: Create trigger function to keep coordinates in sync
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION sync_merchant_coordinates()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Only update if latitude or longitude changed and both are valid
            IF (OLD.merchant_latitude IS DISTINCT FROM NEW.merchant_latitude 
                OR OLD.merchant_longitude IS DISTINCT FROM NEW.merchant_longitude)
                AND NEW.merchant_latitude IS NOT NULL 
                AND NEW.merchant_longitude IS NOT NULL 
                AND NEW.merchant_latitude != 0
                AND NEW.merchant_longitude != 0 THEN
                
                NEW.merchant_coordinates = jsonb_build_object(
                    'type', 'Point',
                    'coordinates', jsonb_build_array(
                        NEW.merchant_longitude,
                        NEW.merchant_latitude
                    )
                );
            ELSIF (NEW.merchant_latitude IS NULL OR NEW.merchant_longitude IS NULL 
                   OR NEW.merchant_latitude = 0 OR NEW.merchant_longitude = 0) THEN
                -- Clear coordinates if lat/lng are null or zero
                NEW.merchant_coordinates = NULL;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `)
    
    console.log('✅ Created sync_merchant_coordinates trigger function')
    
    // Step 3: Create trigger to automatically sync coordinates on UPDATE
    await db.execute(sql`
        DROP TRIGGER IF EXISTS trigger_sync_merchant_coordinates ON merchants;
        
        CREATE TRIGGER trigger_sync_merchant_coordinates
            BEFORE UPDATE ON merchants
            FOR EACH ROW
            EXECUTE FUNCTION sync_merchant_coordinates();
    `)
    
    console.log('✅ Created trigger to automatically sync coordinates on updates')
    
    // Step 4: Verify the synchronization worked
    const result = await db.execute(sql`
        SELECT 
            COUNT(*) as total_merchants,
            COUNT(CASE WHEN merchant_coordinates IS NOT NULL THEN 1 END) as with_coordinates,
            COUNT(CASE WHEN 
                merchant_coordinates->>'type' = 'Point' 
                AND jsonb_array_length(merchant_coordinates->'coordinates') = 2 
            THEN 1 END) as valid_geojson
        FROM merchants;
    `)
    
    console.log('📊 Synchronization results:', result.rows[0])
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    console.log('🔄 Removing coordinate synchronization...')
    
    // Remove trigger
    await db.execute(sql`
        DROP TRIGGER IF EXISTS trigger_sync_merchant_coordinates ON merchants;
    `)
    
    // Remove trigger function
    await db.execute(sql`
        DROP FUNCTION IF EXISTS sync_merchant_coordinates();
    `)
    
    console.log('✅ Removed coordinate synchronization trigger and function')
}

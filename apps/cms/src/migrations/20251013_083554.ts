import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    console.log('🔄 Updating existing merchant records with correct coordinates...')
    
    // Update existing merchant records with correct coordinates from lat/lng
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates = jsonb_build_object(
            'type', 'Point',
            'coordinates', jsonb_build_array(merchant_longitude, merchant_latitude)
        )
        WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL;
    `)
    
    console.log('✅ Successfully updated all existing merchant records with correct coordinates')
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    console.log('🔄 Reverting coordinate updates...')
    // This migration is irreversible as we don't know the original incorrect values
    console.log('⚠️ This migration is irreversible - coordinate updates cannot be undone')
}

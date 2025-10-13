import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    // Update all existing merchants to have correct merchant_coordinates based on their lat/lng
    await db.execute(sql`
        UPDATE merchants 
        SET merchant_coordinates = json_build_object(
            'type', 'Point',
            'coordinates', json_build_array(merchant_longitude, merchant_latitude)
        )::jsonb
        WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL;
    `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    // No rollback needed - this is a data fix migration
}

import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * CLEANUP MIGRATION - Remove database artifacts from deleted migrations
 * 
 * This migration cleans up any database changes that were applied by the 
 * problematic migrations that were removed from the codebase:
 * - 20251005_122737 (vendor user_id column)
 * - 20251005_124730 (vendor user_id nullable)
 * - 20251005_130109_fix_vendor_user_optional
 * - 20251202_delete_extra_tables
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
    console.log('🧹 Starting cleanup migration for removed migrations...')
    
    try {
        // Check if vendors table has user_id column and remove it if it exists
        console.log('🔍 Checking for user_id column in vendors table...')
        
        // Drop the user_id column if it exists (from 20251005_122737)
        await db.execute(sql`
            ALTER TABLE "vendors" DROP COLUMN IF EXISTS "user_id";
        `)
        console.log('✅ Removed user_id column from vendors table (if it existed)')
        
        // Drop any foreign key constraints that might still exist
        await db.execute(sql`
            ALTER TABLE "vendors" DROP CONSTRAINT IF EXISTS "vendors_user_id_users_id_fk";
        `)
        console.log('✅ Removed foreign key constraint (if it existed)')
        
        // Drop any indexes related to user_id
        await db.execute(sql`
            DROP INDEX IF EXISTS "vendors_user_id_unique";
        `)
        console.log('✅ Removed unique index (if it existed)')
        
        console.log('🎉 Cleanup migration completed successfully!')
        
    } catch (error) {
        console.error('❌ Cleanup migration failed:', error)
        throw error
    }
}

export async function down(): Promise<void> {
    console.log('🔄 Reverting cleanup migration...')
    
    // This migration is designed to clean up, so reverting would re-add the problematic changes
    // We don't want to do that, so this is intentionally left empty
    console.log('⚠️  Note: This cleanup migration is not reversible')
    console.log('💡 If you need to restore vendor-user relationships, create a new proper migration')
    console.log('✅ Cleanup migration rollback completed (no action taken)')
}

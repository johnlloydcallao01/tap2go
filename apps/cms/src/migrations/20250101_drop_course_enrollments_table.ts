import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * DROP COURSE ENROLLMENTS TABLE MIGRATION
 * 
 * This migration safely removes the course_enrollments table and all related
 * database objects including indexes, foreign keys, and constraints.
 * 
 * This migration is part of removing the CourseEnrollments collection
 * from the PayloadCMS configuration.
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🗑️ Starting course_enrollments table removal migration...')
  
  try {
    // Drop the course_enrollments table and all its dependencies
    await db.execute(sql`
      -- Drop course_enrollments table completely (CASCADE will handle foreign keys)
      DROP TABLE IF EXISTS "course_enrollments" CASCADE;
      
      -- Drop any remaining indexes that might not have been cascaded
      DROP INDEX IF EXISTS "course_enrollments_student_idx";
      DROP INDEX IF EXISTS "course_enrollments_course_idx";
      DROP INDEX IF EXISTS "course_enrollments_updated_at_idx";
      DROP INDEX IF EXISTS "course_enrollments_created_at_idx";
      DROP INDEX IF EXISTS "course_enrollments_enrolled_by_idx";
      
      -- Remove any references from payload_locked_documents_rels table
      -- (This should already be handled by the schema cleanup, but ensuring consistency)
      ALTER TABLE "payload_locked_documents_rels" 
      DROP COLUMN IF EXISTS "course_enrollments_id";
      
      -- Drop related index from payload_locked_documents_rels
      DROP INDEX IF EXISTS "payload_locked_documents_rels_course_enrollments_id_idx";
    `)
    
    console.log('✅ Successfully dropped course_enrollments table and related objects')
    console.log('🎉 Course enrollments table removal migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Reverting course_enrollments table removal migration...')
  
  // This migration is designed to be irreversible as it removes data
  // The table structure can be recreated, but data will be lost
  console.log('⚠️  WARNING: This migration removes the course_enrollments table permanently')
  console.log('⚠️  Data cannot be recovered without a database backup')
  console.log('⚠️  To restore functionality, you would need to:')
  console.log('   1. Restore the CourseEnrollments collection configuration')
  console.log('   2. Regenerate the schema')
  console.log('   3. Run PayloadCMS migrations to recreate the table')
  
  throw new Error('Cannot restore course_enrollments table - this migration is not reversible without data loss')
}
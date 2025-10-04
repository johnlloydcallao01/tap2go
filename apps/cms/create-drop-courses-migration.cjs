const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tap2go',
});

async function createDropCoursesMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Creating migration to drop courses-related tables and enums...\n');

    // Drop courses-related tables in correct order (respecting foreign key dependencies)
    const dropTablesSQL = `
      -- Drop courses_prerequisites table first (has foreign key to courses)
      DROP TABLE IF EXISTS "courses_prerequisites" CASCADE;
      
      -- Drop courses table (has foreign keys to instructors and course_categories)
      DROP TABLE IF EXISTS "courses" CASCADE;
      
      -- Drop course_categories table
      DROP TABLE IF EXISTS "course_categories" CASCADE;
      
      -- Remove courses-related columns from payload_locked_documents_rels
      ALTER TABLE "payload_locked_documents_rels" 
      DROP COLUMN IF EXISTS "courses_id",
      DROP COLUMN IF EXISTS "course_categories_id";
      
      -- Drop courses-related enum types
      DROP TYPE IF EXISTS "enum_courses_difficulty_level" CASCADE;
      DROP TYPE IF EXISTS "enum_courses_language" CASCADE;
      DROP TYPE IF EXISTS "enum_courses_status" CASCADE;
      DROP TYPE IF EXISTS "enum_course_categories_category_type" CASCADE;
    `;

    await client.query(dropTablesSQL);
    
    console.log('✅ Successfully dropped all courses-related tables and enums');
    console.log('   - Dropped courses_prerequisites table');
    console.log('   - Dropped courses table');
    console.log('   - Dropped course_categories table');
    console.log('   - Removed courses_id and course_categories_id columns from payload_locked_documents_rels');
    console.log('   - Dropped enum_courses_difficulty_level');
    console.log('   - Dropped enum_courses_language');
    console.log('   - Dropped enum_courses_status');
    console.log('   - Dropped enum_course_categories_category_type');
    
  } catch (error) {
    console.error('❌ Error dropping courses-related tables:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createDropCoursesMigration().catch(console.error);
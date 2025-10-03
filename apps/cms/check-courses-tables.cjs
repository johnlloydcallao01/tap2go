const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCoursesRelatedItems() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking courses-related database items...\n');
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('courses', 'course_categories');
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 TABLES:');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`✅ ${row.table_name} - EXISTS`);
      });
    } else {
      console.log('❌ No courses or course_categories tables found');
    }
    
    // Check constraints
    const constraintsQuery = `
      SELECT constraint_name, table_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND (constraint_name LIKE '%courses%' OR constraint_name LIKE '%course_categories%');
    `;
    
    const constraintsResult = await client.query(constraintsQuery);
    console.log('\n🔗 CONSTRAINTS:');
    if (constraintsResult.rows.length > 0) {
      constraintsResult.rows.forEach(row => {
        console.log(`✅ ${row.constraint_name} (${row.constraint_type}) on ${row.table_name} - EXISTS`);
      });
    } else {
      console.log('❌ No courses-related constraints found');
    }
    
    // Check indexes
    const indexesQuery = `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (indexname LIKE '%courses%' OR indexname LIKE '%course_categories%');
    `;
    
    const indexesResult = await client.query(indexesQuery);
    console.log('\n📊 INDEXES:');
    if (indexesResult.rows.length > 0) {
      indexesResult.rows.forEach(row => {
        console.log(`✅ ${row.indexname} on ${row.tablename} - EXISTS`);
      });
    } else {
      console.log('❌ No courses-related indexes found');
    }
    
    // Check columns in payload_locked_documents_rels
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'payload_locked_documents_rels'
      AND (column_name LIKE '%courses%' OR column_name LIKE '%course_categories%');
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('\n📋 COLUMNS in payload_locked_documents_rels:');
    if (columnsResult.rows.length > 0) {
      columnsResult.rows.forEach(row => {
        console.log(`✅ ${row.column_name} (${row.data_type}) - EXISTS`);
      });
    } else {
      console.log('❌ No courses-related columns found in payload_locked_documents_rels');
    }
    
    // Check enum types
    const enumsQuery = `
      SELECT typname 
      FROM pg_type 
      WHERE typname LIKE '%courses%' OR typname LIKE '%course_categories%';
    `;
    
    const enumsResult = await client.query(enumsQuery);
    console.log('\n🏷️  ENUM TYPES:');
    if (enumsResult.rows.length > 0) {
      enumsResult.rows.forEach(row => {
        console.log(`✅ ${row.typname} - EXISTS`);
      });
    } else {
      console.log('❌ No courses-related enum types found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCoursesRelatedItems();
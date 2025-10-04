const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function checkInstructorsTable() {
  try {
    console.log('🔍 Checking instructors table...\n');
    
    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'instructors'
      );
    `;
    
    const tableExists = await pool.query(tableExistsQuery);
    console.log('Table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Get table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'instructors'
        ORDER BY ordinal_position;
      `;
      
      const structure = await pool.query(structureQuery);
      console.log('\n📋 Table structure:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Count records
      const countQuery = 'SELECT COUNT(*) FROM instructors';
      const count = await pool.query(countQuery);
      console.log(`\n📊 Total records: ${count.rows[0].count}`);
      
      // Show sample data if any exists
      if (parseInt(count.rows[0].count) > 0) {
        const sampleQuery = 'SELECT * FROM instructors LIMIT 3';
        const sample = await pool.query(sampleQuery);
        console.log('\n📄 Sample data:');
        sample.rows.forEach((row, index) => {
          console.log(`  Record ${index + 1}:`, row);
        });
      }
      
      // Check for foreign key constraints
      const constraintsQuery = `
        SELECT 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND (tc.table_name = 'instructors' OR ccu.table_name = 'instructors');
      `;
      
      const constraints = await pool.query(constraintsQuery);
      if (constraints.rows.length > 0) {
        console.log('\n🔗 Foreign key constraints:');
        constraints.rows.forEach(constraint => {
          console.log(`  - ${constraint.constraint_name}: ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        });
      } else {
        console.log('\n🔗 No foreign key constraints found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkInstructorsTable();
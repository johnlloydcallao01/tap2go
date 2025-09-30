const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function deleteVendorsCuisineTypesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Deleting vendors_cuisine_types table...');
    
    // Check if table exists first
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendors_cuisine_types'
      );
    `;
    
    const tableExists = await client.query(checkTableQuery);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Table vendors_cuisine_types does not exist');
      return;
    }
    
    // Drop the table
    await client.query('DROP TABLE IF EXISTS vendors_cuisine_types CASCADE;');
    console.log('✅ Successfully deleted vendors_cuisine_types table');
    
    // Also remove any related columns from payload_locked_documents_rels if they exist
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels' 
      AND column_name LIKE '%vendors_cuisine_types%';
    `;
    
    const columns = await client.query(checkColumnQuery);
    
    for (const column of columns.rows) {
      await client.query(`ALTER TABLE payload_locked_documents_rels DROP COLUMN IF EXISTS ${column.column_name};`);
      console.log(`✅ Removed column ${column.column_name} from payload_locked_documents_rels`);
    }
    
    // Drop any related enum types
    await client.query(`DROP TYPE IF EXISTS enum_vendors_cuisine_types_cuisine_type CASCADE;`);
    console.log('✅ Removed related enum types');
    
    console.log('🎉 vendors_cuisine_types table and related data successfully deleted!');
    
  } catch (error) {
    console.error('❌ Error deleting vendors_cuisine_types table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteVendorsCuisineTypesTable();
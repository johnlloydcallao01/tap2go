const { Pool } = require('pg');
require('dotenv').config();

async function checkProductsStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('Checking current products table structure...\n');
    
    // Get column information for products table
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('Current products table columns:');
    console.log('==============================');
    
    if (result.rows.length === 0) {
      console.log('Products table not found or has no columns.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable} - Default: ${row.column_default || 'None'}`);
      });
    }
    
    console.log(`\nTotal columns: ${result.rows.length}`);
    
  } catch (error) {
    console.error('Error checking products table structure:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductsStructure();
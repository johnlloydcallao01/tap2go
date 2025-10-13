const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URI
});

async function checkPostGIS() {
  try {
    // Check PostGIS extension
    const extResult = await pool.query('SELECT * FROM pg_extension WHERE extname = $1', ['postgis']);
    console.log('PostGIS Extension:', extResult.rows);
    
    // Check geometry columns
    const geomResult = await pool.query('SELECT * FROM geometry_columns WHERE f_table_name IN ($1, $2)', ['merchants', 'addresses']);
    console.log('Geometry Columns:', geomResult.rows);
    
    // Check merchant_coordinates column type
    const merchantColResult = await pool.query('SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2', ['merchants', 'merchant_coordinates']);
    console.log('Merchant Coordinates Column:', merchantColResult.rows);
    
    // Check addresses coordinates column type
    const addressColResult = await pool.query('SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2', ['addresses', 'coordinates']);
    console.log('Address Coordinates Column:', addressColResult.rows);
    
    // Check all geometry-related columns in merchants table
    const allMerchantGeomResult = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND (column_name LIKE '%coordinate%' OR column_name LIKE '%geometry%' OR data_type = 'USER-DEFINED')
    `);
    console.log('All Merchant Geometry Columns:', allMerchantGeomResult.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPostGIS();
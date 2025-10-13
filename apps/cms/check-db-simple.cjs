const { Pool } = require('pg');

async function checkDatabaseStatus() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔍 Checking database status...\n');

    // Check column type
    const columnQuery = `
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND column_name = 'merchant_coordinates'
    `;
    
    const columnResult = await pool.query(columnQuery);
    console.log('📊 Column Info:');
    console.log(columnResult.rows);

    // Check actual data
    const dataQuery = `
      SELECT 
        "outletName",
        merchant_coordinates,
        pg_typeof(merchant_coordinates) as data_type,
        LENGTH(merchant_coordinates::text) as length
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL 
      LIMIT 3
    `;
    
    const dataResult = await pool.query(dataQuery);
    console.log('\n📋 Sample Data:');
    dataResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.outletName}:`);
      console.log(`   Type: ${row.data_type}`);
      console.log(`   Length: ${row.length}`);
      console.log(`   Value: ${JSON.stringify(row.merchant_coordinates)}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStatus();
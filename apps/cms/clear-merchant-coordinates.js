import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function clearMerchantCoordinates() {
  console.log('🔍 Connecting to database to clear merchant coordinates...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // First, let's check what merchants have the binary geometry values
    console.log('\n🔍 Checking merchants with binary geometry values...');
    const checkQuery = `
      SELECT 
        id, 
        outlet_name,
        merchant_coordinates,
        CASE 
          WHEN merchant_coordinates IS NULL THEN 'NULL'
          WHEN merchant_coordinates::text LIKE '0101000020E6100000%' THEN 'BINARY_GEOMETRY'
          ELSE 'OTHER'
        END as coordinate_type
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      ORDER BY id;
    `;
    
    const checkResult = await client.query(checkQuery);
    console.log(`\n📊 Found ${checkResult.rows.length} merchants with coordinates:`);
    
    checkResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}, Type: ${row.coordinate_type}`);
      if (row.coordinate_type === 'BINARY_GEOMETRY') {
        console.log(`  Binary value: ${row.merchant_coordinates.toString().substring(0, 50)}...`);
      }
    });
    
    // Count merchants with binary geometry values
    const binaryGeometryCount = checkResult.rows.filter(row => row.coordinate_type === 'BINARY_GEOMETRY').length;
    
    if (binaryGeometryCount === 0) {
      console.log('\n✅ No merchants found with binary geometry values. Nothing to clear.');
      client.release();
      await pool.end();
      return;
    }
    
    console.log(`\n🎯 Found ${binaryGeometryCount} merchants with binary geometry values that need to be cleared.`);
    
    // Clear the binary geometry values by setting them to NULL
    console.log('\n🧹 Clearing binary geometry values...');
    const updateQuery = `
      UPDATE merchants 
      SET merchant_coordinates = NULL 
      WHERE merchant_coordinates::text LIKE '0101000020E6100000%'
      RETURNING id, outlet_name;
    `;
    
    const updateResult = await client.query(updateQuery);
    
    console.log(`\n✅ Successfully cleared merchant_coordinates for ${updateResult.rows.length} merchants:`);
    updateResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}`);
    });
    
    // Verify the update
    console.log('\n🔍 Verifying the update...');
    const verifyResult = await client.query(checkQuery);
    const remainingBinary = verifyResult.rows.filter(row => row.coordinate_type === 'BINARY_GEOMETRY').length;
    
    if (remainingBinary === 0) {
      console.log('✅ All binary geometry values have been successfully cleared!');
    } else {
      console.log(`⚠️  Warning: ${remainingBinary} merchants still have binary geometry values.`);
    }
    
    console.log('\n📊 Final merchant coordinates status:');
    const finalStats = await client.query(`
      SELECT 
        COUNT(*) as total_merchants,
        COUNT(CASE WHEN merchant_coordinates IS NULL THEN 1 END) as null_coordinates,
        COUNT(CASE WHEN merchant_coordinates IS NOT NULL THEN 1 END) as non_null_coordinates
      FROM merchants;
    `);
    
    console.table(finalStats.rows[0]);
    
    client.release();
    console.log('\n🎉 Operation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

clearMerchantCoordinates();
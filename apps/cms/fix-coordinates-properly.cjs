require('dotenv').config();
const { Client } = require('pg');

async function fixCoordinatesProperly() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Connecting to database to fix coordinates properly...');
    await client.connect();
    console.log('✅ Database connection successful');

    // First, let's check the column type
    console.log('\n🔍 Checking merchant_coordinates column type...');
    const columnTypeQuery = `
      SELECT 
        column_name, 
        data_type, 
        udt_name,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
        AND column_name = 'merchant_coordinates';
    `;

    const columnResult = await client.query(columnTypeQuery);
    console.log('Column info:', columnResult.rows[0]);

    // Check current merchant data
    console.log('\n🔍 Checking current merchant coordinates...');
    const checkQuery = `
      SELECT 
        id, 
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        merchant_coordinates,
        pg_typeof(merchant_coordinates) as column_type
      FROM merchants 
      ORDER BY id;
    `;

    const checkResult = await client.query(checkQuery);
    
    console.log(`\n📊 Found ${checkResult.rows.length} merchants:`);
    checkResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}`);
      console.log(`  Lat/Lng: ${row.merchant_latitude}, ${row.merchant_longitude}`);
      console.log(`  Coordinates type: ${row.column_type}`);
      if (row.merchant_coordinates) {
        console.log(`  Coordinates value: ${row.merchant_coordinates.toString().substring(0, 100)}...`);
      }
      console.log('');
    });

    // Now let's set proper JSONB coordinates
    console.log('\n🔄 Setting proper JSONB GeoJSON coordinates...');
    
    for (const merchant of checkResult.rows) {
      if (merchant.merchant_latitude && merchant.merchant_longitude) {
        const lat = parseFloat(merchant.merchant_latitude);
        const lng = parseFloat(merchant.merchant_longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create proper GeoJSON Point
          const geoJsonPoint = {
            type: 'Point',
            coordinates: [lng, lat] // [longitude, latitude]
          };

          // Use JSONB cast to ensure it's stored as JSONB, not geometry
          const updateQuery = `
            UPDATE merchants 
            SET merchant_coordinates = $1::jsonb
            WHERE id = $2
            RETURNING id, outlet_name, merchant_coordinates, pg_typeof(merchant_coordinates) as new_type;
          `;

          const updateResult = await client.query(updateQuery, [
            JSON.stringify(geoJsonPoint),
            merchant.id
          ]);

          console.log(`✅ Updated merchant ID ${merchant.id} (${merchant.outlet_name})`);
          console.log(`   Type: ${updateResult.rows[0].new_type}`);
          console.log(`   Value: ${JSON.stringify(updateResult.rows[0].merchant_coordinates)}`);
        }
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalResult = await client.query(checkQuery);
    
    console.log('\n📊 Final status:');
    finalResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}: ${row.column_type} - ${row.merchant_coordinates ? 'HAS_DATA' : 'NULL'}`);
    });

    console.log('\n🎉 Coordinates fixed properly!');

  } catch (error) {
    console.error('❌ Error fixing coordinates:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
fixCoordinatesProperly()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
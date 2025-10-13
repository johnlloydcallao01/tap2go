require('dotenv').config();
const { Client } = require('pg');

async function checkCurrentCoordinates() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Connecting to database to check current coordinates...');
    await client.connect();
    console.log('✅ Database connection successful');

    // Check all merchants and their coordinate status
    console.log('\n🔍 Checking all merchants and their coordinates...');
    const allMerchantsQuery = `
      SELECT 
        id, 
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        merchant_coordinates,
        CASE 
          WHEN merchant_coordinates IS NULL THEN 'NULL'
          WHEN merchant_coordinates::text = 'null' THEN 'STRING_NULL'
          WHEN merchant_coordinates::jsonb ? 'x' AND merchant_coordinates::jsonb ? 'y' THEN 'XY_FORMAT'
          WHEN merchant_coordinates::jsonb ? 'type' AND merchant_coordinates::jsonb ? 'coordinates' THEN 'GEOJSON_FORMAT'
          ELSE 'UNKNOWN_FORMAT'
        END as coordinate_format
      FROM merchants 
      ORDER BY id;
    `;

    const allResult = await client.query(allMerchantsQuery);
    
    console.log(`\n📊 Found ${allResult.rows.length} total merchants:`);
    allResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}`);
      console.log(`  Lat/Lng: ${row.merchant_latitude}, ${row.merchant_longitude}`);
      console.log(`  Coordinates: ${row.merchant_coordinates ? JSON.stringify(row.merchant_coordinates) : 'NULL'}`);
      console.log(`  Format: ${row.coordinate_format}`);
      console.log('');
    });

    // If we have merchants with lat/lng but no proper coordinates, let's fix them
    const merchantsWithLatLng = allResult.rows.filter(row => 
      row.merchant_latitude && row.merchant_longitude && 
      (row.coordinate_format === 'NULL' || row.coordinate_format === 'XY_FORMAT')
    );

    if (merchantsWithLatLng.length > 0) {
      console.log(`\n🔄 Found ${merchantsWithLatLng.length} merchants with lat/lng that need proper GeoJSON coordinates.`);
      console.log('Converting to proper GeoJSON format...');

      for (const merchant of merchantsWithLatLng) {
        const lat = parseFloat(merchant.merchant_latitude);
        const lng = parseFloat(merchant.merchant_longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const geoJsonCoordinates = {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
          };

          const updateQuery = `
            UPDATE merchants 
            SET merchant_coordinates = $1
            WHERE id = $2
            RETURNING id, outlet_name, merchant_coordinates;
          `;

          const updateResult = await client.query(updateQuery, [
            JSON.stringify(geoJsonCoordinates),
            merchant.id
          ]);

          console.log(`✅ Updated merchant ID ${merchant.id} (${merchant.outlet_name})`);
          console.log(`   New coordinates: ${JSON.stringify(updateResult.rows[0].merchant_coordinates)}`);
        }
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalResult = await client.query(allMerchantsQuery);
    
    const formatCounts = finalResult.rows.reduce((acc, row) => {
      acc[row.coordinate_format] = (acc[row.coordinate_format] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Final merchant coordinates status:');
    console.table(formatCounts);

    console.log('\n🎉 Coordinate check completed!');

  } catch (error) {
    console.error('❌ Error checking coordinates:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
checkCurrentCoordinates()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
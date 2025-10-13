require('dotenv').config();
const { Client } = require('pg');

async function fixCoordinatesGeometry() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Connecting to database to fix coordinates with PostGIS...');
    await client.connect();
    console.log('✅ Database connection successful');

    // Check current merchant data
    console.log('\n🔍 Checking current merchant coordinates...');
    const checkQuery = `
      SELECT 
        id, 
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        merchant_coordinates,
        ST_AsGeoJSON(merchant_coordinates) as geojson_format,
        ST_X(merchant_coordinates) as x_coord,
        ST_Y(merchant_coordinates) as y_coord
      FROM merchants 
      ORDER BY id;
    `;

    const checkResult = await client.query(checkQuery);
    
    console.log(`\n📊 Found ${checkResult.rows.length} merchants:`);
    checkResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}`);
      console.log(`  Lat/Lng: ${row.merchant_latitude}, ${row.merchant_longitude}`);
      if (row.merchant_coordinates) {
        console.log(`  Current X/Y: ${row.x_coord}, ${row.y_coord}`);
        console.log(`  GeoJSON: ${row.geojson_format}`);
      } else {
        console.log(`  Coordinates: NULL`);
      }
      console.log('');
    });

    // Now let's set proper PostGIS Point geometry
    console.log('\n🔄 Setting proper PostGIS Point geometry...');
    
    for (const merchant of checkResult.rows) {
      if (merchant.merchant_latitude && merchant.merchant_longitude) {
        const lat = parseFloat(merchant.merchant_latitude);
        const lng = parseFloat(merchant.merchant_longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Use ST_SetSRID and ST_MakePoint to create proper PostGIS geometry
          const updateQuery = `
            UPDATE merchants 
            SET merchant_coordinates = ST_SetSRID(ST_MakePoint($1, $2), 4326)
            WHERE id = $3
            RETURNING 
              id, 
              outlet_name, 
              ST_AsGeoJSON(merchant_coordinates) as geojson_format,
              ST_X(merchant_coordinates) as x_coord,
              ST_Y(merchant_coordinates) as y_coord;
          `;

          const updateResult = await client.query(updateQuery, [lng, lat, merchant.id]);
          const updated = updateResult.rows[0];

          console.log(`✅ Updated merchant ID ${merchant.id} (${merchant.outlet_name})`);
          console.log(`   X/Y: ${updated.x_coord}, ${updated.y_coord}`);
          console.log(`   GeoJSON: ${updated.geojson_format}`);
        }
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalResult = await client.query(checkQuery);
    
    console.log('\n📊 Final status:');
    finalResult.rows.forEach(row => {
      console.log(`- ID: ${row.id} (${row.outlet_name}):`);
      if (row.merchant_coordinates) {
        console.log(`  ✅ Has coordinates: X=${row.x_coord}, Y=${row.y_coord}`);
        console.log(`  📍 GeoJSON: ${row.geojson_format}`);
      } else {
        console.log(`  ❌ No coordinates`);
      }
    });

    // Test if the coordinates work with PostGIS queries
    console.log('\n🧪 Testing PostGIS spatial query...');
    const testQuery = `
      SELECT 
        id,
        outlet_name,
        ST_AsGeoJSON(merchant_coordinates) as geojson,
        ST_Distance(
          merchant_coordinates,
          ST_SetSRID(ST_MakePoint(120.9844057, 14.5872103), 4326)
        ) as distance_degrees
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      ORDER BY distance_degrees;
    `;

    const testResult = await client.query(testQuery);
    console.log('\n🎯 Spatial query results:');
    testResult.rows.forEach(row => {
      console.log(`- ${row.outlet_name}: Distance = ${row.distance_degrees} degrees`);
    });

    console.log('\n🎉 Coordinates fixed with PostGIS geometry!');

  } catch (error) {
    console.error('❌ Error fixing coordinates:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
fixCoordinatesGeometry()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
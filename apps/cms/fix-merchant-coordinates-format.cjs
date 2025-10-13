require('dotenv').config();
const { Client } = require('pg');

async function fixMerchantCoordinatesFormat() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Connecting to database to fix merchant coordinates format...');
    await client.connect();
    console.log('✅ Database connection successful');

    // Step 1: Check current merchant_coordinates format
    console.log('\n🔍 Checking current merchant_coordinates format...');
    const checkQuery = `
      SELECT 
        id, 
        outlet_name,
        merchant_coordinates,
        CASE 
          WHEN merchant_coordinates IS NULL THEN 'NULL'
          WHEN merchant_coordinates::text = 'null' THEN 'STRING_NULL'
          WHEN merchant_coordinates::jsonb ? 'x' AND merchant_coordinates::jsonb ? 'y' THEN 'XY_FORMAT'
          WHEN merchant_coordinates::jsonb ? 'type' AND merchant_coordinates::jsonb ? 'coordinates' THEN 'GEOJSON_FORMAT'
          ELSE 'UNKNOWN_FORMAT'
        END as coordinate_format
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      ORDER BY id;
    `;

    const checkResult = await client.query(checkQuery);
    
    console.log(`\n📊 Found ${checkResult.rows.length} merchants with coordinates:`);
    checkResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}, Format: ${row.coordinate_format}`);
      if (row.coordinate_format === 'XY_FORMAT') {
        console.log(`  Current: ${JSON.stringify(row.merchant_coordinates)}`);
        const x = row.merchant_coordinates.x;
        const y = row.merchant_coordinates.y;
        console.log(`  Will convert to: {"type": "Point", "coordinates": [${x}, ${y}]}`);
      }
    });

    // Count merchants that need conversion
    const xyFormatCount = checkResult.rows.filter(row => row.coordinate_format === 'XY_FORMAT').length;
    
    if (xyFormatCount === 0) {
      console.log('\n✅ No merchants found with {x, y} format. All coordinates are already in correct format!');
      return;
    }

    console.log(`\n🎯 Found ${xyFormatCount} merchants with {x, y} format that need conversion.`);

    // Step 2: Convert {x, y} format to GeoJSON Point format
    console.log('\n🔄 Converting {x, y} format to GeoJSON Point format...');
    
    const updateQuery = `
      UPDATE merchants 
      SET merchant_coordinates = jsonb_build_object(
        'type', 'Point',
        'coordinates', jsonb_build_array(
          (merchant_coordinates->>'x')::double precision,
          (merchant_coordinates->>'y')::double precision
        )
      )
      WHERE merchant_coordinates::jsonb ? 'x' 
        AND merchant_coordinates::jsonb ? 'y'
        AND NOT (merchant_coordinates::jsonb ? 'type')
      RETURNING id, outlet_name, merchant_coordinates;
    `;

    const updateResult = await client.query(updateQuery);
    
    console.log(`\n✅ Successfully converted merchant_coordinates for ${updateResult.rows.length} merchants:`);
    updateResult.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Name: ${row.outlet_name}`);
      console.log(`  New format: ${JSON.stringify(row.merchant_coordinates)}`);
    });

    // Step 3: Verify the conversion
    console.log('\n🔍 Verifying the conversion...');
    const verifyResult = await client.query(checkQuery);
    
    const formatCounts = verifyResult.rows.reduce((acc, row) => {
      acc[row.coordinate_format] = (acc[row.coordinate_format] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Final merchant coordinates format status:');
    console.table(formatCounts);

    const remainingXYFormat = verifyResult.rows.filter(row => row.coordinate_format === 'XY_FORMAT').length;
    
    if (remainingXYFormat === 0) {
      console.log('\n🎉 All merchant coordinates are now in proper GeoJSON Point format!');
    } else {
      console.log(`\n⚠️  Warning: ${remainingXYFormat} merchants still have {x, y} format.`);
    }

    console.log('\n🎉 Coordinate format conversion completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing merchant coordinates format:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
fixMerchantCoordinatesFormat()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
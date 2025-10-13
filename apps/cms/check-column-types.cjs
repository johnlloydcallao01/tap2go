require('dotenv').config();
const { Client } = require('pg');

async function checkColumnTypes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Connecting to database to check column types...');
    await client.connect();
    console.log('✅ Database connection successful');

    // Check the actual column types in the merchants table
    console.log('\n🔍 Checking merchants table column types...');
    const columnTypesQuery = `
      SELECT 
        column_name, 
        data_type, 
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
        AND column_name IN ('merchant_coordinates', 'service_area_geometry', 'priority_zones_geometry')
      ORDER BY column_name;
    `;

    const columnResult = await client.query(columnTypesQuery);
    
    console.log('\n📊 Column types in merchants table:');
    console.table(columnResult.rows);

    // Check what PayloadCMS is actually reading
    console.log('\n🔍 Checking what PayloadCMS reads from merchant_coordinates...');
    const dataQuery = `
      SELECT 
        id,
        outlet_name,
        merchant_coordinates,
        pg_typeof(merchant_coordinates) as actual_type,
        ST_AsGeoJSON(merchant_coordinates) as as_geojson,
        ST_X(merchant_coordinates) as x_coord,
        ST_Y(merchant_coordinates) as y_coord
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      LIMIT 2;
    `;

    const dataResult = await client.query(dataQuery);
    
    console.log('\n📊 Actual data in merchant_coordinates:');
    dataResult.rows.forEach(row => {
      console.log(`\n- ID: ${row.id} (${row.outlet_name})`);
      console.log(`  Type: ${row.actual_type}`);
      console.log(`  X/Y: ${row.x_coord}, ${row.y_coord}`);
      console.log(`  GeoJSON: ${row.as_geojson}`);
      console.log(`  Raw value type: ${typeof row.merchant_coordinates}`);
      if (row.merchant_coordinates) {
        console.log(`  Raw value: ${row.merchant_coordinates.toString().substring(0, 100)}...`);
      }
    });

    // Check if there are any PostGIS extensions
    console.log('\n🔍 Checking PostGIS extensions...');
    const extensionsQuery = `
      SELECT 
        extname, 
        extversion 
      FROM pg_extension 
      WHERE extname LIKE '%postgis%';
    `;

    const extensionsResult = await client.query(extensionsQuery);
    console.log('\n📊 PostGIS extensions:');
    console.table(extensionsResult.rows);

    console.log('\n🎉 Column type check completed!');

  } catch (error) {
    console.error('❌ Error checking column types:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
checkColumnTypes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
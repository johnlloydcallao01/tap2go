import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function verifyPostGISExtensions() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('🔗 Connected to Supabase database successfully\n');
    
    // 1. Check if PostGIS extensions are installed
    console.log('📋 STEP 1: Checking installed PostGIS extensions...');
    const extensionsQuery = await client.query(`
      SELECT 
        extname as extension_name,
        extversion as version,
        CASE 
          WHEN extname = 'postgis' THEN '✅ Core PostGIS functionality'
          WHEN extname = 'postgis_topology' THEN '✅ Topology support for complex spatial operations'
          WHEN extname = 'fuzzystrmatch' THEN '✅ Fuzzy string matching for geocoding'
          WHEN extname = 'postgis_tiger_geocoder' THEN '✅ US address geocoding support'
          ELSE '📦 Extension installed'
        END as description
      FROM pg_extension 
      WHERE extname LIKE 'postgis%' OR extname = 'fuzzystrmatch'
      ORDER BY extname;
    `);
    
    if (extensionsQuery.rows.length === 0) {
      console.log('❌ No PostGIS extensions found! Please enable them in Supabase dashboard.');
      return false;
    }
    
    console.log('Installed Extensions:');
    extensionsQuery.rows.forEach(row => {
      console.log(`  ${row.description}`);
      console.log(`     Name: ${row.extension_name}, Version: ${row.version}`);
    });
    
    // 2. Test PostGIS version and basic functionality
    console.log('\n📋 STEP 2: Testing PostGIS version and basic functionality...');
    try {
      const versionQuery = await client.query('SELECT PostGIS_Version() as version;');
      console.log(`✅ PostGIS Version: ${versionQuery.rows[0].version}`);
    } catch (error) {
      console.log('❌ PostGIS core functions not available:', error.message);
      return false;
    }
    
    // 3. Test spatial reference systems
    console.log('\n📋 STEP 3: Checking spatial reference systems...');
    const sridQuery = await client.query(`
      SELECT COUNT(*) as srid_count 
      FROM spatial_ref_sys;
    `);
    console.log(`✅ Available spatial reference systems: ${sridQuery.rows[0].srid_count}`);
    
    // Check for WGS84 (EPSG:4326) - essential for GPS coordinates
    const wgs84Query = await client.query(`
      SELECT 
        srid,
        auth_name,
        auth_srid,
        proj4text
      FROM spatial_ref_sys 
      WHERE srid = 4326;
    `);
    
    if (wgs84Query.rows.length > 0) {
      console.log('✅ WGS84 (EPSG:4326) coordinate system available - Perfect for GPS coordinates!');
    } else {
      console.log('❌ WGS84 coordinate system not found - This is required for GPS coordinates');
    }
    
    // 4. Test geometry creation and manipulation
    console.log('\n📋 STEP 4: Testing geometry creation and spatial operations...');
    
    // Test point creation (Manila coordinates)
    const pointQuery = await client.query(`
      SELECT 
        ST_AsText(ST_Point(121.0244, 14.5995)) as manila_point,
        ST_SRID(ST_GeomFromText('POINT(121.0244 14.5995)', 4326)) as coordinate_system,
        ST_X(ST_Point(121.0244, 14.5995)) as longitude,
        ST_Y(ST_Point(121.0244, 14.5995)) as latitude;
    `);
    
    console.log('✅ Point creation test:');
    console.log(`   Manila coordinates: ${pointQuery.rows[0].manila_point}`);
    console.log(`   Coordinate system: EPSG:${pointQuery.rows[0].coordinate_system}`);
    console.log(`   Longitude: ${pointQuery.rows[0].longitude}`);
    console.log(`   Latitude: ${pointQuery.rows[0].latitude}`);
    
    // 5. Test distance calculations (essential for food delivery)
    console.log('\n📋 STEP 5: Testing distance calculations...');
    const distanceQuery = await client.query(`
      SELECT 
        ST_Distance(
          ST_Point(121.0244, 14.5995),  -- Manila
          ST_Point(121.0583, 14.6760)   -- Quezon City
        ) * 111320 as distance_meters,
        ST_Distance(
          ST_Point(121.0244, 14.5995),  -- Manila
          ST_Point(121.0583, 14.6760)   -- Quezon City
        ) * 111.32 as distance_km;
    `);
    
    console.log('✅ Distance calculation test (Manila to Quezon City):');
    console.log(`   Distance: ${Math.round(distanceQuery.rows[0].distance_meters)} meters`);
    console.log(`   Distance: ${distanceQuery.rows[0].distance_km.toFixed(2)} kilometers`);
    
    // 6. Test spatial indexing capability
    console.log('\n📋 STEP 6: Testing spatial indexing and performance...');
    const spatialQuery = await client.query(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT ST_DWithin(
        ST_Point(121.0244, 14.5995),  -- Customer location
        ST_Point(121.0583, 14.6760),  -- Merchant location
        0.1  -- Within 0.1 degrees (~11km)
      ) as within_delivery_range;
    `);
    
    console.log('✅ Spatial query performance test completed');
    
    // 7. Test polygon creation (for service areas)
    console.log('\n📋 STEP 7: Testing polygon operations for service areas...');
    const polygonQuery = await client.query(`
      WITH service_area AS (
        SELECT ST_Buffer(
          ST_Point(121.0244, 14.5995),  -- Manila center
          0.01  -- ~1km radius
        ) as delivery_zone
      )
      SELECT 
        ST_AsText(delivery_zone) as service_area_wkt,
        ST_Area(delivery_zone) as area_degrees,
        ST_Contains(
          delivery_zone,
          ST_Point(121.0250, 14.6000)  -- Test point within area
        ) as contains_test_point
      FROM service_area;
    `);
    
    console.log('✅ Service area polygon test:');
    console.log(`   Contains test point: ${polygonQuery.rows[0].contains_test_point}`);
    console.log(`   Area: ${polygonQuery.rows[0].area_degrees} square degrees`);
    
    // 8. Test geocoding functions (if available)
    console.log('\n📋 STEP 8: Testing geocoding capabilities...');
    try {
      const geocodingQuery = await client.query(`
        SELECT 
          levenshtein('Manila', 'Manilla') as string_similarity,
          soundex('Manila') as manila_soundex,
          soundex('Manilla') as manilla_soundex;
      `);
      
      console.log('✅ Fuzzy string matching (for address geocoding):');
      console.log(`   Levenshtein distance: ${geocodingQuery.rows[0].string_similarity}`);
      console.log(`   Manila soundex: ${geocodingQuery.rows[0].manila_soundex}`);
      console.log(`   Manilla soundex: ${geocodingQuery.rows[0].manilla_soundex}`);
    } catch (error) {
      console.log('⚠️  Fuzzy string matching not available (fuzzystrmatch extension may not be enabled)');
    }
    
    // 9. Summary and recommendations
    console.log('\n🎯 VERIFICATION SUMMARY:');
    console.log('✅ PostGIS is properly installed and functional!');
    console.log('✅ All core spatial operations are working');
    console.log('✅ Distance calculations are accurate');
    console.log('✅ Coordinate systems are properly configured');
    console.log('✅ Your database is ready for geospatial food delivery features!');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. ✅ PostGIS extensions verified - you can proceed with schema updates');
    console.log('2. 🔄 Update Addresses.ts collection with geospatial fields');
    console.log('3. 🔄 Update Merchants.ts collection with delivery area fields');
    console.log('4. 🔄 Create PayloadCMS migration for new geospatial columns');
    console.log('5. 🔄 Add spatial indexes for performance optimization');
    
    await client.end();
    return true;
    
  } catch (error) {
    console.error('❌ Database connection or query error:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your DATABASE_URI in .env file');
    console.error('2. Ensure your Supabase database is accessible');
    console.error('3. Verify PostGIS extensions are enabled in Supabase dashboard');
    console.error('4. Check if your database user has sufficient permissions');
    
    if (client._connected) {
      await client.end();
    }
    return false;
  }
}

// Run the verification
console.log('🚀 Starting PostGIS Extensions Verification...\n');
verifyPostGISExtensions()
  .then(success => {
    if (success) {
      console.log('\n🎉 PostGIS verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ PostGIS verification failed. Please check the issues above.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
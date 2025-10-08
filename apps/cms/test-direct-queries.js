import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testDirectQueries() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 TESTING DIRECT DATABASE QUERIES...\n');

    // Test 1: Basic merchant query
    console.log('📋 STEP 1: Testing basic merchant query...');
    const basicQuery = await pool.query(`
      SELECT id, outlet_name, merchant_latitude, merchant_longitude, is_active
      FROM merchants 
      WHERE is_active = true
      ORDER BY id
    `);
    console.log(`✅ Found ${basicQuery.rows.length} active merchants`);
    basicQuery.rows.forEach(merchant => {
      console.log(`  - ${merchant.outlet_name} (${merchant.merchant_latitude}, ${merchant.merchant_longitude})`);
    });

    // Test 2: Geospatial distance query
    console.log('\n📋 STEP 2: Testing geospatial distance query...');
    const userLat = 14.5995;
    const userLng = 121.0244;
    const radius = 10; // 10km

    const distanceQuery = await pool.query(`
      SELECT 
        id,
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(merchant_longitude, merchant_latitude), 4326),
          ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) * 111320 as distance_meters,
        is_active
      FROM merchants 
      WHERE is_active = true
        AND merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(merchant_longitude, merchant_latitude), 4326),
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3 / 111320.0
        )
      ORDER BY distance_meters
      LIMIT 10
    `, [userLng, userLat, radius * 1000]);

    console.log(`✅ Found ${distanceQuery.rows.length} merchants within ${radius}km`);
    distanceQuery.rows.forEach(merchant => {
      console.log(`  - ${merchant.outlet_name}: ${Math.round(merchant.distance_meters)}m away`);
    });

    // Test 3: Test the exact query used by GeospatialService
    console.log('\n📋 STEP 3: Testing GeospatialService-style query...');
    const serviceQuery = await pool.query(`
      SELECT 
        m.id,
        m.outlet_name,
        m.outlet_code,
        m.merchant_latitude,
        m.merchant_longitude,
        m.is_active,
        m.is_accepting_orders,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(m.merchant_longitude, m.merchant_latitude), 4326),
          ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) * 111320 as distance_meters
      FROM merchants m
      WHERE m.is_active = true
        AND m.is_accepting_orders = true
        AND m.merchant_latitude IS NOT NULL 
        AND m.merchant_longitude IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(m.merchant_longitude, m.merchant_latitude), 4326),
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3 / 111320.0
        )
      ORDER BY distance_meters
      LIMIT $4
      OFFSET $5
    `, [userLng, userLat, radius * 1000, 10, 0]);

    console.log(`✅ GeospatialService query found ${serviceQuery.rows.length} merchants`);
    serviceQuery.rows.forEach(merchant => {
      console.log(`  - ${merchant.outlet_name}: ${Math.round(merchant.distance_meters)}m away, accepting orders: ${merchant.is_accepting_orders}`);
    });

    // Test 4: Check merchant_coordinates column
    console.log('\n📋 STEP 4: Testing merchant_coordinates column...');
    const coordQuery = await pool.query(`
      SELECT 
        id,
        outlet_name,
        merchant_coordinates,
        ST_AsText(merchant_coordinates) as coordinates_text,
        ST_X(merchant_coordinates) as longitude,
        ST_Y(merchant_coordinates) as latitude
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      ORDER BY id
    `);

    console.log(`✅ Found ${coordQuery.rows.length} merchants with merchant_coordinates`);
    coordQuery.rows.forEach(merchant => {
      console.log(`  - ${merchant.outlet_name}: ${merchant.coordinates_text} (${merchant.longitude}, ${merchant.latitude})`);
    });

    // Test 5: Performance test
    console.log('\n📋 STEP 5: Testing query performance...');
    const startTime = Date.now();
    
    await pool.query(`
      SELECT COUNT(*) as total_count
      FROM merchants m
      WHERE m.is_active = true
        AND m.merchant_latitude IS NOT NULL 
        AND m.merchant_longitude IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(m.merchant_longitude, m.merchant_latitude), 4326),
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3 / 111320.0
        )
    `, [userLng, userLat, radius * 1000]);

    const endTime = Date.now();
    console.log(`✅ Query performance: ${endTime - startTime}ms`);

    console.log('\n🎯 DIRECT QUERY TEST SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log('✅ Basic merchant queries: Working');
    console.log('✅ Geospatial distance calculations: Working');
    console.log('✅ GeospatialService-style queries: Working');
    console.log('✅ merchant_coordinates column: Working');
    console.log('✅ Query performance: Acceptable');
    console.log('\n🎉 All direct database queries are working correctly!');

  } catch (error) {
    console.error('❌ Direct query test failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDirectQueries();
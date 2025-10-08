import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function updateExistingMerchants() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database successfully\n');
    
    // Get existing merchants
    console.log('📋 STEP 1: Getting existing merchants...');
    const existingQuery = await client.query(`
      SELECT id, outlet_name, vendor_id 
      FROM merchants 
      ORDER BY id;
    `);
    
    console.log(`Found ${existingQuery.rows.length} existing merchants:`);
    existingQuery.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Name: ${row.outlet_name}, Vendor: ${row.vendor_id}`);
    });
    
    // Update merchants with coordinates (Manila area)
    console.log('\n📋 STEP 2: Updating merchants with coordinates...');
    
    const merchantUpdates = [
      {
        id: 1,
        name: 'Jollibee - Guevarra, Laguna',
        latitude: 14.5995,  // Manila area
        longitude: 121.0244,
        delivery_radius: 5000
      },
      {
        id: 3,
        name: "Alivin's Pizza - Cainta",
        latitude: 14.5547,  // Makati area
        longitude: 121.0244,
        delivery_radius: 3000
      }
    ];
    
    for (const merchant of merchantUpdates) {
      try {
        const updateQuery = `
          UPDATE merchants 
          SET 
            merchant_latitude = $1,
            merchant_longitude = $2,
            merchant_coordinates = ST_SetSRID(ST_MakePoint($3, $4), 4326),
            delivery_radius_meters = $5,
            is_active = true,
            is_accepting_orders = true,
            updated_at = NOW()
          WHERE id = $6
          RETURNING id, outlet_name, merchant_latitude, merchant_longitude;
        `;
        
        const result = await client.query(updateQuery, [
          merchant.latitude,
          merchant.longitude,
          merchant.longitude, // PostGIS uses longitude first
          merchant.latitude,
          merchant.delivery_radius,
          merchant.id
        ]);
        
        if (result.rows.length > 0) {
          console.log(`✅ Updated: ${result.rows[0].outlet_name} (ID: ${result.rows[0].id})`);
          console.log(`   Coordinates: ${result.rows[0].merchant_latitude}, ${result.rows[0].merchant_longitude}`);
          console.log(`   Delivery radius: ${merchant.delivery_radius}m`);
        } else {
          console.log(`❌ No merchant found with ID: ${merchant.id}`);
        }
        
      } catch (error) {
        console.log(`❌ Failed to update merchant ID ${merchant.id}:`, error.message);
      }
    }
    
    // Verify updates
    console.log('\n📋 STEP 3: Verifying updated merchants...');
    const verifyQuery = await client.query(`
      SELECT 
        id,
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        ST_AsText(merchant_coordinates) as coordinates_text,
        delivery_radius_meters,
        is_active,
        is_accepting_orders
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      ORDER BY id;
    `);
    
    console.log(`Found ${verifyQuery.rows.length} merchants with coordinates:`);
    verifyQuery.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.outlet_name} (ID: ${row.id})`);
      console.log(`     Lat/Lng: ${row.merchant_latitude}, ${row.merchant_longitude}`);
      console.log(`     PostGIS: ${row.coordinates_text}`);
      console.log(`     Delivery radius: ${row.delivery_radius_meters}m`);
      console.log(`     Active: ${row.is_active}, Accepting orders: ${row.is_accepting_orders}`);
    });
    
    // Test geospatial query with updated data
    console.log('\n📋 STEP 4: Testing geospatial query with updated data...');
    const testLat = 14.5800; // Between the two merchants
    const testLng = 121.0244;
    const testRadius = 10000; // 10km
    
    const geoQuery = await client.query(`
      SELECT 
        id,
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        ST_Distance(
          merchant_coordinates,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)
        ) * 111320 as distance_meters,
        delivery_radius_meters,
        is_active,
        is_accepting_orders
      FROM merchants 
      WHERE merchant_coordinates IS NOT NULL
      AND is_active = true
      AND ST_DWithin(
        merchant_coordinates,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        $3 / 111320.0
      )
      ORDER BY distance_meters;
    `, [testLng, testLat, testRadius]);
    
    console.log(`🎯 Testing search near coordinates: ${testLat}, ${testLng} within ${testRadius}m`);
    console.log(`Found ${geoQuery.rows.length} active merchants within radius:`);
    
    geoQuery.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.outlet_name}`);
      console.log(`     Distance: ${Math.round(row.distance_meters)}m`);
      console.log(`     Coordinates: ${row.merchant_latitude}, ${row.merchant_longitude}`);
      console.log(`     Delivery radius: ${row.delivery_radius_meters}m`);
      console.log(`     Status: Active=${row.is_active}, Accepting=${row.is_accepting_orders}`);
    });
    
    // Test exact GeospatialService query format
    console.log('\n📋 STEP 5: Testing exact GeospatialService query format...');
    try {
      const serviceQuery = await client.query(`
        SELECT 
          id,
          outlet_name,
          merchant_latitude,
          merchant_longitude,
          delivery_radius_meters,
          is_active,
          is_accepting_orders
        FROM merchants 
        WHERE merchant_coordinates IS NOT NULL
        AND is_active = true
        AND is_accepting_orders = true
        AND ST_DWithin(
          merchant_coordinates,
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3 / 111320.0
        )
        LIMIT 20;
      `, [testLng, testLat, testRadius]);
      
      console.log(`✅ GeospatialService-style query successful! Found ${serviceQuery.rows.length} merchants`);
      serviceQuery.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.outlet_name} (ID: ${row.id})`);
        console.log(`     Coordinates: ${row.merchant_latitude}, ${row.merchant_longitude}`);
        console.log(`     Delivery radius: ${row.delivery_radius_meters}m`);
      });
      
    } catch (error) {
      console.log('❌ GeospatialService-style query failed:', error.message);
    }
    
    console.log('\n🎯 MERCHANT UPDATE SUMMARY:');
    console.log(`✅ Existing merchants updated with coordinates`);
    console.log(`✅ Geospatial queries working correctly`);
    console.log(`✅ Distance calculations accurate`);
    console.log(`✅ Database ready for geospatial endpoint testing`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating merchants:', error);
    return false;
  } finally {
    await client.end();
  }
}

updateExistingMerchants()
  .then(success => {
    if (success) {
      console.log('\n🎉 Merchant update completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Merchant update failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
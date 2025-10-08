import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkMerchantData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database successfully\n');
    
    // 1. Check if merchants table exists
    console.log('📋 STEP 1: Checking merchants table structure...');
    const tableExistsQuery = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'merchants'
      );
    `);
    
    if (!tableExistsQuery.rows[0].exists) {
      console.log('❌ Merchants table does not exist!');
      return false;
    }
    
    console.log('✅ Merchants table exists');
    
    // 2. Check table structure and geospatial columns
    console.log('\n📋 STEP 2: Checking merchants table columns...');
    const columnsQuery = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('Available columns:');
    const columns = {};
    columnsQuery.rows.forEach(row => {
      columns[row.column_name] = row.data_type;
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // 3. Check for geospatial coordinate columns
    console.log('\n📋 STEP 3: Checking for coordinate columns...');
    const geoColumns = [
      'merchant_coordinates',
      'merchant_latitude', 
      'merchant_longitude',
      'geospatial_coordinates'
    ];
    
    const foundGeoColumns = [];
    geoColumns.forEach(col => {
      if (columns[col]) {
        foundGeoColumns.push(col);
        console.log(`✅ Found: ${col} (${columns[col]})`);
      } else {
        console.log(`❌ Missing: ${col}`);
      }
    });
    
    if (foundGeoColumns.length === 0) {
      console.log('❌ No geospatial coordinate columns found!');
      return false;
    }
    
    // 4. Count total merchants
    console.log('\n📋 STEP 4: Counting merchants...');
    const countQuery = await client.query('SELECT COUNT(*) as total FROM merchants;');
    const totalMerchants = parseInt(countQuery.rows[0].total);
    console.log(`📊 Total merchants: ${totalMerchants}`);
    
    if (totalMerchants === 0) {
      console.log('❌ No merchants found in database!');
      return false;
    }
    
    // 5. Check merchants with coordinates
    console.log('\n📋 STEP 5: Checking merchants with coordinate data...');
    
    // Check different coordinate column combinations
    const coordinateChecks = [];
    
    if (columns['merchant_latitude'] && columns['merchant_longitude']) {
      const latLngQuery = await client.query(`
        SELECT COUNT(*) as count 
        FROM merchants 
        WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL
        AND merchant_latitude != 0 
        AND merchant_longitude != 0;
      `);
      coordinateChecks.push({
        type: 'lat/lng columns',
        count: parseInt(latLngQuery.rows[0].count)
      });
    }
    
    if (columns['merchant_coordinates']) {
      const coordQuery = await client.query(`
        SELECT COUNT(*) as count 
        FROM merchants 
        WHERE merchant_coordinates IS NOT NULL;
      `);
      coordinateChecks.push({
        type: 'merchant_coordinates column',
        count: parseInt(coordQuery.rows[0].count)
      });
    }
    
    if (columns['geospatial_coordinates']) {
      const geoQuery = await client.query(`
        SELECT COUNT(*) as count 
        FROM merchants 
        WHERE geospatial_coordinates IS NOT NULL;
      `);
      coordinateChecks.push({
        type: 'geospatial_coordinates column',
        count: parseInt(geoQuery.rows[0].count)
      });
    }
    
    coordinateChecks.forEach(check => {
      console.log(`📍 Merchants with ${check.type}: ${check.count}/${totalMerchants}`);
    });
    
    // 6. Sample merchant data with coordinates
    console.log('\n📋 STEP 6: Sampling merchant coordinate data...');
    
    let sampleQuery = '';
    if (columns['merchant_latitude'] && columns['merchant_longitude']) {
      sampleQuery = `
        SELECT 
          id, 
          outlet_name,
          merchant_latitude, 
          merchant_longitude,
          is_active
        FROM merchants 
        WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL
        AND merchant_latitude != 0 
        AND merchant_longitude != 0
        LIMIT 5;
      `;
    } else if (columns['merchant_coordinates']) {
      sampleQuery = `
        SELECT 
          id, 
          outlet_name,
          merchant_coordinates,
          is_active
        FROM merchants 
        WHERE merchant_coordinates IS NOT NULL
        LIMIT 5;
      `;
    }
    
    if (sampleQuery) {
      const sampleResult = await client.query(sampleQuery);
      if (sampleResult.rows.length > 0) {
        console.log('Sample merchants with coordinates:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row.outlet_name || 'Unnamed'} (ID: ${row.id})`);
          if (row.merchant_latitude && row.merchant_longitude) {
            console.log(`     Coordinates: ${row.merchant_latitude}, ${row.merchant_longitude}`);
          }
          if (row.merchant_coordinates) {
            console.log(`     Coordinates: ${row.merchant_coordinates}`);
          }
          console.log(`     Active: ${row.is_active}`);
        });
      } else {
        console.log('❌ No merchants found with valid coordinates!');
        return false;
      }
    }
    
    // 7. Check active merchants
    console.log('\n📋 STEP 7: Checking active merchants...');
    const activeQuery = await client.query(`
      SELECT COUNT(*) as count 
      FROM merchants 
      WHERE is_active = true;
    `);
    const activeMerchants = parseInt(activeQuery.rows[0].count);
    console.log(`🟢 Active merchants: ${activeMerchants}/${totalMerchants}`);
    
    // 8. Test a simple geospatial query
    console.log('\n📋 STEP 8: Testing geospatial query...');
    
    if (columns['merchant_coordinates']) {
      try {
        const geoTestQuery = await client.query(`
          SELECT 
            id,
            outlet_name,
            ST_AsText(merchant_coordinates) as coordinates_text,
            ST_Distance(
              merchant_coordinates,
              ST_SetSRID(ST_MakePoint(121.0583, 14.6760), 4326)
            ) as distance_degrees
          FROM merchants 
          WHERE merchant_coordinates IS NOT NULL
          AND ST_DWithin(
            merchant_coordinates,
            ST_SetSRID(ST_MakePoint(121.0583, 14.6760), 4326),
            0.1
          )
          LIMIT 3;
        `);
        
        if (geoTestQuery.rows.length > 0) {
          console.log('✅ Geospatial query successful! Found nearby merchants:');
          geoTestQuery.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.outlet_name} - Distance: ${parseFloat(row.distance_degrees).toFixed(6)} degrees`);
          });
        } else {
          console.log('⚠️  Geospatial query returned no results (no merchants near test coordinates)');
        }
      } catch (error) {
        console.log('❌ Geospatial query failed:', error.message);
        return false;
      }
    }
    
    console.log('\n🎯 MERCHANT DATA VERIFICATION SUMMARY:');
    console.log(`✅ Database connection: Working`);
    console.log(`✅ Merchants table: Exists`);
    console.log(`✅ Total merchants: ${totalMerchants}`);
    console.log(`✅ Active merchants: ${activeMerchants}`);
    
    const hasValidCoordinates = coordinateChecks.some(check => check.count > 0);
    if (hasValidCoordinates) {
      console.log(`✅ Coordinate data: Available`);
      console.log(`✅ Geospatial queries: Working`);
    } else {
      console.log(`❌ Coordinate data: Missing or invalid`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking merchant data:', error);
    return false;
  } finally {
    await client.end();
  }
}

checkMerchantData()
  .then(success => {
    if (success) {
      console.log('\n🎉 Merchant data verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Merchant data verification failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
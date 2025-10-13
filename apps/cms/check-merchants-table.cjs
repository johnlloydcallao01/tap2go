const { Pool } = require('pg');
require('dotenv').config();

async function checkMerchantsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    const client = await pool.connect();
    console.log('🔍 Checking merchants table...\n');

    // 1. Check table structure
    console.log('📋 MERCHANTS TABLE STRUCTURE:');
    const tableStructure = await client.query(`
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      ORDER BY ordinal_position;
    `);
    
    console.table(tableStructure.rows);

    // 2. Check specifically merchant_coordinates column
    console.log('\n🎯 MERCHANT_COORDINATES COLUMN DETAILS:');
    const coordColumn = await client.query(`
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND column_name = 'merchant_coordinates';
    `);
    
    console.table(coordColumn.rows);

    // 3. Check PostGIS geometry details if it's geometry type
    if (coordColumn.rows.length > 0 && coordColumn.rows[0].udt_name === 'geometry') {
      console.log('\n🌍 POSTGIS GEOMETRY DETAILS:');
      const geometryDetails = await client.query(`
        SELECT 
          f_table_name,
          f_geometry_column,
          coord_dimension,
          srid,
          type
        FROM geometry_columns 
        WHERE f_table_name = 'merchants' 
        AND f_geometry_column = 'merchant_coordinates';
      `);
      
      if (geometryDetails.rows.length > 0) {
        console.table(geometryDetails.rows);
      } else {
        console.log('No PostGIS geometry metadata found');
      }
    }

    // 4. Check actual data
    console.log('\n📊 MERCHANTS DATA SAMPLE:');
    const merchantData = await client.query(`
      SELECT 
        id,
        outlet_name,
        merchant_latitude,
        merchant_longitude,
        merchant_coordinates,
        CASE 
          WHEN merchant_coordinates IS NOT NULL THEN 'HAS_COORDINATES'
          ELSE 'NO_COORDINATES'
        END as coord_status
      FROM merchants 
      LIMIT 5;
    `);
    
    console.table(merchantData.rows);

    // 5. Test PostGIS functions if geometry exists
    if (coordColumn.rows.length > 0 && coordColumn.rows[0].udt_name === 'geometry') {
      console.log('\n🧪 TESTING POSTGIS FUNCTIONS:');
      
      try {
        const spatialTest = await client.query(`
          SELECT 
            id,
            outlet_name,
            ST_AsText(merchant_coordinates) as coordinates_text,
            ST_SRID(merchant_coordinates) as srid
          FROM merchants 
          WHERE merchant_coordinates IS NOT NULL
          LIMIT 2;
        `);
        
        console.log('✅ PostGIS functions work:');
        console.table(spatialTest.rows);
      } catch (error) {
        console.log('❌ PostGIS functions failed:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error checking merchants table:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkMerchantsTable();
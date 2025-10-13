const { Pool } = require('pg');
require('dotenv').config();

async function checkGeometryFields() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    const client = await pool.connect();
    console.log('🔍 Checking JSON/JSONB fields in merchants table...\n');

    // Get all JSON/JSONB columns
    const jsonColumns = await client.query(`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND (data_type = 'json' OR udt_name = 'jsonb')
      ORDER BY column_name;
    `);
    
    console.log('📋 JSON/JSONB COLUMNS IN MERCHANTS TABLE:');
    console.table(jsonColumns.rows);

    // Check sample data for each JSON column to determine if it's geometry
    console.log('\n🔍 ANALYZING EACH JSON FIELD:\n');
    
    for (const column of jsonColumns.rows) {
      const columnName = column.column_name;
      console.log(`\n--- ${columnName.toUpperCase()} ---`);
      
      try {
        // Get sample data
        const sampleData = await client.query(`
          SELECT 
            ${columnName},
            CASE 
              WHEN ${columnName} IS NULL THEN 'NULL'
              WHEN ${columnName}::text LIKE '%coordinates%' THEN 'LIKELY_GEOMETRY'
              WHEN ${columnName}::text LIKE '%geometry%' THEN 'LIKELY_GEOMETRY'
              WHEN ${columnName}::text LIKE '%Point%' THEN 'LIKELY_GEOMETRY'
              WHEN ${columnName}::text LIKE '%Polygon%' THEN 'LIKELY_GEOMETRY'
              WHEN ${columnName}::text LIKE '%type%' AND ${columnName}::text LIKE '%Feature%' THEN 'GEOJSON'
              ELSE 'REGULAR_JSON'
            END as field_type
          FROM merchants 
          WHERE ${columnName} IS NOT NULL
          LIMIT 3;
        `);

        if (sampleData.rows.length > 0) {
          console.log(`Type: ${sampleData.rows[0].field_type}`);
          console.log(`Sample data:`, JSON.stringify(sampleData.rows[0][columnName], null, 2).substring(0, 200) + '...');
        } else {
          console.log('No data found');
        }

      } catch (error) {
        console.log(`Error analyzing ${columnName}:`, error.message);
      }
    }

    // Check if any of these fields are used in spatial queries
    console.log('\n\n🎯 GEOMETRY FIELD RECOMMENDATIONS:\n');
    
    const geometryFields = [
      'service_area_geometry',
      'priority_zones_geometry', 
      'restricted_areas_geometry',
      'delivery_zones_geometry'
    ];

    for (const field of geometryFields) {
      const exists = jsonColumns.rows.find(col => col.column_name === field);
      if (exists) {
        console.log(`✅ ${field}: SHOULD BE CONVERTED TO PostGIS geometry`);
      }
    }

    const regularJsonFields = [
      'operatingHours',
      'specialHours', 
      'interiorImages',
      'menuImages',
      'tags',
      'delivery_hours'
    ];

    for (const field of regularJsonFields) {
      const exists = jsonColumns.rows.find(col => col.column_name === field);
      if (exists) {
        console.log(`📝 ${field}: KEEP AS JSON (not geometry-related)`);
      }
    }

    client.release();
  } catch (error) {
    console.error('❌ Error checking geometry fields:', error.message);
  } finally {
    await pool.end();
  }
}

checkGeometryFields();
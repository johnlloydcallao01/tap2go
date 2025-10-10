const { Client } = require('pg');
require('dotenv').config();

async function checkServiceAreaColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check column information
    const columnInfo = await client.query(`
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'merchants' AND column_name = 'service_area'
    `);

    console.log('\n=== SERVICE_AREA Column Information ===');
    console.log(columnInfo.rows[0]);

    // Check if there are any records with service_area data
    const countQuery = await client.query(`
      SELECT COUNT(*) as total_count,
             COUNT(service_area) as non_null_count
      FROM merchants
    `);

    console.log('\n=== Record Counts ===');
    console.log(countQuery.rows[0]);

    // Get sample data to understand the structure
    const sampleData = await client.query(`
      SELECT id, service_area, 
             pg_typeof(service_area) as data_type_actual
      FROM merchants 
      WHERE service_area IS NOT NULL 
      LIMIT 5
    `);

    console.log('\n=== Sample Data ===');
    sampleData.rows.forEach((row, index) => {
      console.log(`Sample ${index + 1}:`, {
        id: row.id,
        service_area: row.service_area,
        actual_type: row.data_type_actual
      });
    });

    // Check if it's a PostGIS geometry type
    const geometryCheck = await client.query(`
      SELECT 
        f_table_name,
        f_geometry_column,
        coord_dimension,
        srid,
        type
      FROM geometry_columns 
      WHERE f_table_name = 'merchants' AND f_geometry_column = 'service_area'
    `);

    if (geometryCheck.rows.length > 0) {
      console.log('\n=== PostGIS Geometry Information ===');
      console.log(geometryCheck.rows[0]);
    } else {
      console.log('\n=== No PostGIS geometry information found ===');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkServiceAreaColumn();
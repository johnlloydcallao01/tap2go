require('dotenv').config();
const { Client } = require('pg');

async function checkCoordinatesColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check column info
    const columnInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'addresses' AND column_name = 'coordinates'
    `);
    console.log('Coordinates column info:', columnInfo.rows);

    // Check sample data
    const sampleData = await client.query(`
      SELECT coordinates 
      FROM addresses 
      WHERE coordinates IS NOT NULL 
      LIMIT 3
    `);
    console.log('Sample coordinates data:', sampleData.rows);

    // Check data types of existing coordinates
    if (sampleData.rows.length > 0) {
      console.log('Type of first coordinate:', typeof sampleData.rows[0].coordinates);
      console.log('First coordinate value:', sampleData.rows[0].coordinates);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkCoordinatesColumn();
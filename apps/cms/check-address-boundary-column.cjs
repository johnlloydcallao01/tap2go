require('dotenv').config();
const { Client } = require('pg');

async function checkAddressBoundaryColumn() {
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
      WHERE table_name = 'addresses' AND column_name = 'address_boundary'
    `);
    console.log('Address boundary column info:', columnInfo.rows);

    // Check sample data
    const sampleData = await client.query(`
      SELECT address_boundary 
      FROM addresses 
      WHERE address_boundary IS NOT NULL 
      LIMIT 3
    `);
    console.log('Sample address_boundary data:', sampleData.rows);

    // Check data types of existing address_boundary
    if (sampleData.rows.length > 0) {
      console.log('Type of first address_boundary:', typeof sampleData.rows[0].address_boundary);
      console.log('First address_boundary value:', sampleData.rows[0].address_boundary);
    }

    // Check total count of non-null address_boundary records
    const countResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM addresses 
      WHERE address_boundary IS NOT NULL
    `);
    console.log('Total non-null address_boundary records:', countResult.rows[0].count);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkAddressBoundaryColumn();
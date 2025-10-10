require('dotenv').config();
const { Client } = require('pg');

async function investigateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get merchants table schema
    console.log('\n=== MERCHANTS TABLE SCHEMA ===');
    const merchantsSchema = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Merchants table columns:');
    merchantsSchema.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.udt_name}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Get addresses table schema
    console.log('\n=== ADDRESSES TABLE SCHEMA ===');
    const addressesSchema = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'addresses' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Addresses table columns:');
    addressesSchema.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.udt_name}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Check foreign key relationships
    console.log('\n=== FOREIGN KEY RELATIONSHIPS ===');
    const foreignKeys = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'merchants' OR tc.table_name = 'addresses');
    `);
    
    console.log('Foreign key relationships:');
    foreignKeys.rows.forEach(row => {
      console.log(`- ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });

    // Sample data from merchants table
    console.log('\n=== SAMPLE MERCHANTS DATA ===');
    const merchantsSample = await client.query(`
      SELECT 
        id,
        active_address_id,
        merchant_latitude,
        merchant_longitude
      FROM merchants 
      LIMIT 5;
    `);
    
    console.log('Sample merchants data:');
    merchantsSample.rows.forEach(row => {
      console.log(`- ID: ${row.id}, active_address_id: ${row.active_address_id}, lat: ${row.merchant_latitude}, lng: ${row.merchant_longitude}`);
    });

    // Sample data from addresses table
    console.log('\n=== SAMPLE ADDRESSES DATA ===');
    const addressesSample = await client.query(`
      SELECT 
        id,
        latitude,
        longitude
      FROM addresses 
      LIMIT 5;
    `);
    
    console.log('Sample addresses data:');
    addressesSample.rows.forEach(row => {
      console.log(`- ID: ${row.id}, lat: ${row.latitude}, lng: ${row.longitude}`);
    });

    // Check for existing triggers
    console.log('\n=== EXISTING TRIGGERS ===');
    const triggers = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_timing,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table IN ('merchants', 'addresses')
      ORDER BY event_object_table, trigger_name;
    `);
    
    if (triggers.rows.length > 0) {
      console.log('Existing triggers:');
      triggers.rows.forEach(row => {
        console.log(`- ${row.trigger_name} on ${row.event_object_table}: ${row.action_timing} ${row.event_manipulation}`);
      });
    } else {
      console.log('No existing triggers found on merchants or addresses tables.');
    }

  } catch (error) {
    console.error('Error investigating schema:', error);
  } finally {
    await client.end();
  }
}

investigateSchema();
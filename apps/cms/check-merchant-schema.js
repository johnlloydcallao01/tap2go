import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkMerchantSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database successfully\n');
    
    // Get detailed schema information
    console.log('📋 STEP 1: Checking merchant table constraints...');
    const constraintsQuery = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        tc.is_deferrable,
        tc.initially_deferred
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'merchants'
      AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'NOT NULL', 'CHECK')
      ORDER BY tc.constraint_type, kcu.column_name;
    `);
    
    console.log('Table constraints:');
    constraintsQuery.rows.forEach(row => {
      console.log(`  ${row.constraint_type}: ${row.column_name} (${row.constraint_name})`);
    });
    
    // Get NOT NULL columns specifically
    console.log('\n📋 STEP 2: Checking NOT NULL columns...');
    const notNullQuery = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'merchants'
      AND is_nullable = 'NO'
      ORDER BY ordinal_position;
    `);
    
    console.log('NOT NULL columns (required fields):');
    notNullQuery.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type}) - Default: ${row.column_default || 'None'}`);
    });
    
    // Check foreign key relationships
    console.log('\n📋 STEP 3: Checking foreign key relationships...');
    const fkQuery = await client.query(`
      SELECT 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'merchants';
    `);
    
    console.log('Foreign key relationships:');
    fkQuery.rows.forEach(row => {
      console.log(`  ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    
    // Check if vendors table exists and get sample data
    console.log('\n📋 STEP 4: Checking vendors table...');
    try {
      const vendorsExistQuery = await client.query(`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'vendors';
      `);
      
      if (vendorsExistQuery.rows[0].count > 0) {
        const vendorsCountQuery = await client.query('SELECT COUNT(*) as count FROM vendors;');
        console.log(`✅ Vendors table exists with ${vendorsCountQuery.rows[0].count} records`);
        
        if (vendorsCountQuery.rows[0].count > 0) {
          const sampleVendorQuery = await client.query('SELECT id, name FROM vendors LIMIT 3;');
          console.log('Sample vendors:');
          sampleVendorQuery.rows.forEach(row => {
            console.log(`  ID: ${row.id}, Name: ${row.name || 'N/A'}`);
          });
        }
      } else {
        console.log('❌ Vendors table does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking vendors table:', error.message);
    }
    
    // Check existing merchants structure
    console.log('\n📋 STEP 5: Checking existing merchants...');
    const existingMerchantsQuery = await client.query(`
      SELECT 
        id,
        outlet_name,
        vendor_id,
        merchant_latitude,
        merchant_longitude,
        is_active,
        created_at
      FROM merchants 
      LIMIT 5;
    `);
    
    console.log(`Found ${existingMerchantsQuery.rows.length} existing merchants:`);
    existingMerchantsQuery.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}`);
      console.log(`     Name: ${row.outlet_name || 'N/A'}`);
      console.log(`     Vendor ID: ${row.vendor_id || 'NULL'}`);
      console.log(`     Coordinates: ${row.merchant_latitude || 'NULL'}, ${row.merchant_longitude || 'NULL'}`);
      console.log(`     Active: ${row.is_active}`);
      console.log(`     Created: ${row.created_at}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking merchant schema:', error);
    return false;
  } finally {
    await client.end();
  }
}

checkMerchantSchema()
  .then(success => {
    if (success) {
      console.log('\n🎉 Schema check completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Schema check failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
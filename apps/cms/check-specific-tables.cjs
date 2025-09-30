const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function checkSpecificTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking tables that start with "products" and "merchants"...\n');
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const allTables = result.rows.map(row => row.table_name);
    
    // Filter tables that start with "products" or "merchants"
    const productTables = allTables.filter(table => table.startsWith('products'));
    const merchantTables = allTables.filter(table => table.startsWith('merchants'));
    
    console.log('📋 TABLES STARTING WITH "products":');
    if (productTables.length > 0) {
      productTables.forEach(table => {
        if (table === 'products') {
          console.log(`   ✅ ${table} (CORE TABLE - should exist)`);
        } else {
          console.log(`   ❌ ${table} (EXTRA TABLE - should be deleted)`);
        }
      });
    } else {
      console.log('   (none found)');
    }
    
    console.log('\n📋 TABLES STARTING WITH "merchants":');
    if (merchantTables.length > 0) {
      merchantTables.forEach(table => {
        if (table === 'merchants') {
          console.log(`   ✅ ${table} (CORE TABLE - should exist)`);
        } else {
          console.log(`   ❌ ${table} (EXTRA TABLE - should be deleted)`);
        }
      });
    } else {
      console.log('   (none found)');
    }
    
    // Get extra tables to delete
    const extraTables = [
      ...productTables.filter(table => table !== 'products'),
      ...merchantTables.filter(table => table !== 'merchants')
    ];
    
    console.log('\n🗑️  EXTRA TABLES TO DELETE:');
    if (extraTables.length > 0) {
      extraTables.forEach(table => console.log(`   - ${table}`));
      console.log(`\n📊 Total extra tables found: ${extraTables.length}`);
    } else {
      console.log('   ✅ No extra tables found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSpecificTables();
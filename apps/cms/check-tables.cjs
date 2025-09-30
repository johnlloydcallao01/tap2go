const { Pool } = require('pg');
require('dotenv').config();

async function checkTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('🔍 Checking database tables...\n');
    
    // Get all tables in the public schema
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${result.rows.length} tables:\n`);
    
    // Categorize tables
    const coreTables = [];
    const extraTables = [];
    const systemTables = [];
    
    result.rows.forEach(row => {
      const tableName = row.table_name;
      
      if (['vendors', 'merchants', 'products', 'prod_categories'].includes(tableName)) {
        coreTables.push(tableName);
      } else if (tableName.startsWith('prod_') || tableName.includes('variant') || tableName.includes('assoc')) {
        extraTables.push(tableName);
      } else {
        systemTables.push(tableName);
      }
    });

    console.log('✅ CORE TABLES (Should exist):');
    coreTables.forEach(table => console.log(`   - ${table}`));
    
    if (extraTables.length > 0) {
      console.log('\n❌ EXTRA TABLES (Should NOT exist):');
      extraTables.forEach(table => console.log(`   - ${table}`));
    }
    
    console.log('\n📋 SYSTEM TABLES:');
    systemTables.forEach(table => console.log(`   - ${table}`));
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Core tables: ${coreTables.length}/4`);
    console.log(`   Extra tables: ${extraTables.length} (should be 0)`);
    console.log(`   System tables: ${systemTables.length}`);
    
    if (extraTables.length > 0) {
      console.log('\n🚨 WARNING: Extra tables found that should be removed!');
    } else {
      console.log('\n✅ Database is clean - only core tables exist!');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
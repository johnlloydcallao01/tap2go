const { Pool } = require('pg');
require('dotenv').config();

async function checkCurrentTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    console.log('Checking current database tables...\n');
    
    // Get all tables in the public schema
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Current tables in database:');
    console.log('=========================');
    
    if (result.rows.length === 0) {
      console.log('No tables found in the database.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
    console.log(`\nTotal tables: ${result.rows.length}`);
    
    // Check specifically for media table
    const mediaCheck = result.rows.find(row => row.table_name === 'media');
    if (mediaCheck) {
      console.log('\n✅ Media table EXISTS');
    } else {
      console.log('\n❌ Media table NOT FOUND');
    }
    
    // Check for product management tables
    const productTables = [
      'products', 'prod_attributes', 'prod_attribute_terms', 'prod_variations',
      'prod_variation_values', 'prod_grouped_items', 'vendor_products', 
      'merchant_products', 'modifier_groups', 'modifier_options', 'prod_tags',
      'prod_tags_junction', 'tag_groups', 'tag_group_memberships'
    ];
    
    console.log('\nProduct Management Tables Status:');
    console.log('================================');
    productTables.forEach(tableName => {
      const exists = result.rows.find(row => row.table_name === tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    });
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentTables();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function deleteRemainingExtraTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  DELETING ALL REMAINING EXTRA TABLES...\n');
    
    // List of all remaining extra tables that need to be deleted
    const extraTables = [
      // Products sub-tables
      'products_availability_seasonal_availability',
      'products_dietary_allergens',
      'products_dietary_ingredients', 
      'products_media_additional_images',
      'products_nutrition_vitamins',
      'products_pricing_price_history',
      'products_seo_keywords',
      'products_tags',
      // Merchants sub-tables
      'merchants_media_interior_images',
      'merchants_media_menu_images',
      'merchants_special_hours',
      'merchants_tags'
    ];
    
    console.log(`🗑️  Dropping ${extraTables.length} extra tables...`);
    
    for (const tableName of extraTables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`✅ DELETED TABLE: ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Table ${tableName} not found or already deleted`);
      }
    }
    
    // Also drop any related enum types that might exist
    console.log('\n🗑️  Dropping any related enum types...');
    
    const possibleEnumTypes = [
      'enum_products_availability_seasonal_availability_season',
      'enum_products_dietary_allergens_allergen',
      'enum_products_dietary_ingredients_ingredient',
      'enum_products_nutrition_vitamins_vitamin',
      'enum_products_seo_keywords_keyword',
      'enum_products_tags_tag',
      'enum_merchants_tags_tag'
    ];
    
    for (const enumType of possibleEnumTypes) {
      try {
        await client.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`✅ DELETED ENUM: ${enumType}`);
      } catch (error) {
        console.log(`⚠️  Enum ${enumType} not found or already deleted`);
      }
    }
    
    console.log('\n🎉 ALL REMAINING EXTRA TABLES HAVE BEEN DELETED!');
    console.log('\n✅ Only these 4 core tables should remain:');
    console.log('   - vendors');
    console.log('   - merchants');
    console.log('   - products');
    console.log('   - prod_categories');
    
  } catch (error) {
    console.error('❌ Error deleting tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteRemainingExtraTables();
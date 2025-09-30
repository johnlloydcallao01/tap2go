const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function deleteAllExtraTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  DELETING ALL EXTRA TABLES...\n');
    
    // List of all extra tables that need to be deleted
    const extraTables = [
      'prod_cat_assoc',
      'prod_cat_assoc_conditions_customer_segments',
      'prod_cat_assoc_metadata_tags',
      'prod_categories_attributes_dietary_tags',
      'prod_categories_availability_region_restrictions',
      'prod_categories_availability_seasonal_availability',
      'prod_categories_seo_keywords',
      'prod_categories_styling_gradient_colors',
      'prod_var_options',
      'prod_var_options_nutrition_allergen_changes',
      'prod_var_options_rels',
      'prod_var_options_settings_tags',
      'prod_variants',
      'prod_variants_availability_available_days'
    ];
    
    // First, drop all foreign key constraints and indexes that might reference these tables
    console.log('🔗 Dropping foreign key constraints and indexes...');
    
    // Drop any foreign key constraints from payload_locked_documents_rels
    const constraintQueries = [
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_prod_var_options_fk;',
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_prod_variants_fk;',
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_prod_cat_assoc_fk;'
    ];
    
    for (const query of constraintQueries) {
      try {
        await client.query(query);
        console.log('✅ Dropped constraint');
      } catch (error) {
        console.log('⚠️  Constraint not found or already dropped');
      }
    }
    
    // Drop any indexes that might reference these tables
    const indexQueries = [
      'DROP INDEX IF EXISTS payload_locked_documents_rels_prod_var_options_id_idx;',
      'DROP INDEX IF EXISTS payload_locked_documents_rels_prod_variants_id_idx;',
      'DROP INDEX IF EXISTS payload_locked_documents_rels_prod_cat_assoc_id_idx;'
    ];
    
    for (const query of indexQueries) {
      try {
        await client.query(query);
        console.log('✅ Dropped index');
      } catch (error) {
        console.log('⚠️  Index not found or already dropped');
      }
    }
    
    // Drop any columns from payload_locked_documents_rels that reference these tables
    const columnQueries = [
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP COLUMN IF EXISTS prod_var_options_id;',
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP COLUMN IF EXISTS prod_variants_id;',
      'ALTER TABLE IF EXISTS payload_locked_documents_rels DROP COLUMN IF EXISTS prod_cat_assoc_id;'
    ];
    
    for (const query of columnQueries) {
      try {
        await client.query(query);
        console.log('✅ Dropped column from payload_locked_documents_rels');
      } catch (error) {
        console.log('⚠️  Column not found or already dropped');
      }
    }
    
    // Now drop all the extra tables
    console.log('\n🗑️  Dropping all extra tables...');
    
    for (const tableName of extraTables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`✅ DELETED TABLE: ${tableName}`);
      } catch (error) {
        console.log(`⚠️  Table ${tableName} not found or already deleted`);
      }
    }
    
    // Drop any enum types that were created for these tables
    console.log('\n🗑️  Dropping enum types...');
    
    const enumTypes = [
      'enum_prod_var_options_nutritional_impact_allergen_changes_allergen',
      'enum_prod_var_options_nutritional_impact_allergen_changes_change_type',
      'enum_prod_var_options_settings_tags_tag',
      'enum_prod_variants_availability_available_days_day',
      'enum_prod_cat_assoc_conditions_customer_segments_segment',
      'enum_prod_cat_assoc_metadata_tags_tag',
      'enum_prod_categories_attributes_dietary_tags_tag',
      'enum_prod_categories_availability_region_restrictions_region',
      'enum_prod_categories_availability_seasonal_availability_season',
      'enum_prod_categories_seo_keywords_keyword',
      'enum_prod_categories_styling_gradient_colors_color'
    ];
    
    for (const enumType of enumTypes) {
      try {
        await client.query(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`✅ DELETED ENUM: ${enumType}`);
      } catch (error) {
        console.log(`⚠️  Enum ${enumType} not found or already deleted`);
      }
    }
    
    console.log('\n🎉 ALL EXTRA TABLES HAVE BEEN DELETED!');
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

deleteAllExtraTables();
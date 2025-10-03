import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * DELETE EXTRA TABLES MIGRATION
 * 
 * This migration safely removes all extra product-related tables that are no longer needed.
 * Following the database-modification-guide.md safety rules.
 * 
 * Tables to be removed:
 * - All product variant and option tables
 * - All product category association tables  
 * - All merchant sub-tables
 * - All vendor sub-tables
 * 
 * Only keeping core tables: vendors, merchants, products, prod_categories
 */

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🗑️ Starting SAFE extra tables deletion migration...')

  try {
    // Step 1: Remove foreign key constraints and columns from payload_locked_documents_rels
    console.log('🔗 Removing foreign key constraints...')
    
    const constraintsToRemove = [
      'prod_var_optionsID', 'prod_variantsID', 'prod_cat_assocID'
    ]

    for (const constraint of constraintsToRemove) {
      await db.execute(sql`
        ALTER TABLE payload_locked_documents_rels 
        DROP COLUMN IF EXISTS ${sql.identifier(constraint)} CASCADE;
      `)
    }

    // Step 2: Drop all extra tables
    console.log('🗑️ Dropping extra tables...')
    
    const tablesToDrop = [
      // Product variant tables
      'prod_variants_availability_available_days',
      'prod_variants',
      'prod_var_options_nutrition_allergen_changes',
      'prod_var_options_rels',
      'prod_var_options_settings_tags',
      'prod_var_options',
      
      // Product category association tables
      'prod_cat_assoc_conditions_customer_segments',
      'prod_cat_assoc_metadata_tags',
      'prod_cat_assoc',
      
      // Product category sub-tables
      'prod_categories_attributes_dietary_tags',
      'prod_categories_availability_region_restrictions',
      'prod_categories_availability_seasonal_availability',
      'prod_categories_seo_keywords',
      'prod_categories_styling_gradient_colors',
      
      // Product sub-tables
      'products_availability_seasonal_availability',
      'products_dietary_allergens',
      'products_dietary_ingredients',
      'products_media_additional_images',
      'products_nutrition_vitamins',
      'products_pricing_price_history',
      'products_seo_keywords',
      'products_tags',
      
      // Merchant sub-tables
      'merchants_media_interior_images',
      'merchants_media_menu_images',
      'merchants_special_hours',
      'merchants_tags',
      
      // Vendor sub-tables
      'vendors_cuisine_types'
    ]

    for (const table of tablesToDrop) {
      await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(table)} CASCADE;`)
      console.log(`✅ Dropped table: ${table}`)
    }

    // Step 3: Drop all related enum types
    console.log('🗑️ Dropping enum types...')
    
    const enumsToDrop = [
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
      'enum_prod_categories_styling_gradient_colors_color',
      'enum_products_availability_seasonal_availability_season',
      'enum_products_dietary_allergens_allergen',
      'enum_products_dietary_ingredients_ingredient',
      'enum_products_nutrition_vitamins_vitamin',
      'enum_products_seo_keywords_keyword',
      'enum_products_tags_tag',
      'enum_merchants_tags_tag',
      'enum_vendors_cuisine_types_cuisine_type'
    ]

    for (const enumType of enumsToDrop) {
      await db.execute(sql`DROP TYPE IF EXISTS ${sql.identifier(enumType)} CASCADE;`)
      console.log(`✅ Dropped enum: ${enumType}`)
    }

    // Step 4: Drop any remaining indexes
    console.log('🗑️ Dropping related indexes...')
    
    const indexesToDrop = [
      'prod_variants_created_at_idx',
      'prod_variants_updated_at_idx',
      'prod_var_options_created_at_idx',
      'prod_var_options_updated_at_idx',
      'prod_cat_assoc_created_at_idx',
      'prod_cat_assoc_updated_at_idx'
    ]

    for (const index of indexesToDrop) {
      await db.execute(sql`DROP INDEX IF EXISTS ${sql.identifier(index)};`)
    }

    console.log('🎉 Extra tables deletion migration completed successfully!')
    console.log('✅ Only core tables remain: vendors, merchants, products, prod_categories')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export async function down(): Promise<void> {
  console.log('🔄 Reverting extra tables deletion migration...')
  
  // This migration is designed to be irreversible for safety
  // The deleted tables contained complex relationships that would be difficult to recreate
  console.log('⚠️  Note: This migration is irreversible - deleted tables cannot be restored')
  console.log('💡 If you need to restore functionality, you would need to:')
  console.log('   1. Recreate the collection definitions in PayloadCMS')
  console.log('   2. Generate new migrations for the required tables')
  console.log('   3. Manually restore any data from backups')
  console.log('✅ Migration rollback completed (no action taken)')
}
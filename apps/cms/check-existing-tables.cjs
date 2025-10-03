const { Pool } = require('pg');
require('dotenv').config();

async function checkExistingTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    const tablesToCheck = [
      'courses_prerequisites',
      'vendors_cuisine_types', 
      'merchants_special_hours',
      'merchants_media_interior_images',
      'merchants_media_menu_images',
      'merchants_tags',
      'prod_categories_styling_gradient_colors',
      'prod_categories_attributes_dietary_tags',
      'prod_categories_seo_keywords',
      'prod_categories_availability_seasonal_availability',
      'prod_categories_availability_region_restrictions',
      'products_dietary_allergens',
      'products_dietary_ingredients',
      'products_availability_seasonal_availability',
      'products_tags'
    ];

    console.log('Checking which tables exist in the database...\n');

    const existingTables = [];
    const nonExistingTables = [];

    for (const tableName of tablesToCheck) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      if (result.rows[0].exists) {
        existingTables.push(tableName);
        console.log(`✅ ${tableName} - EXISTS`);
      } else {
        nonExistingTables.push(tableName);
        console.log(`❌ ${tableName} - DOES NOT EXIST`);
      }
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`Existing tables: ${existingTables.length}`);
    console.log(`Non-existing tables: ${nonExistingTables.length}`);

    if (existingTables.length > 0) {
      console.log(`\n🗑️  Tables to DROP:`);
      existingTables.forEach(table => console.log(`  - ${table}`));
    }

    if (nonExistingTables.length > 0) {
      console.log(`\n⚠️  Tables that don't exist (skip DROP):`);
      nonExistingTables.forEach(table => console.log(`  - ${table}`));
    }

    // Check if JSON columns already exist
    console.log(`\n🔍 Checking if JSON columns already exist...`);
    
    const columnsToCheck = [
      { table: 'courses', column: 'prerequisites' },
      { table: 'vendors', column: 'cuisine_types' },
      { table: 'merchants', column: 'special_hours' },
      { table: 'merchants', column: 'media_interior_images' },
      { table: 'merchants', column: 'media_menu_images' },
      { table: 'merchants', column: 'tags' },
      { table: 'prod_categories', column: 'styling_gradient_colors' },
      { table: 'prod_categories', column: 'attributes_dietary_tags' },
      { table: 'prod_categories', column: 'seo_keywords' },
      { table: 'prod_categories', column: 'availability_seasonal_availability' },
      { table: 'prod_categories', column: 'availability_region_restrictions' },
      { table: 'products', column: 'dietary_allergens' },
      { table: 'products', column: 'dietary_ingredients' },
      { table: 'products', column: 'availability_seasonal_availability' },
      { table: 'products', column: 'tags' }
    ];

    const existingColumns = [];
    const missingColumns = [];

    for (const { table, column } of columnsToCheck) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1 
          AND column_name = $2
        );
      `, [table, column]);

      if (result.rows[0].exists) {
        existingColumns.push(`${table}.${column}`);
        console.log(`✅ ${table}.${column} - EXISTS`);
      } else {
        missingColumns.push(`${table}.${column}`);
        console.log(`❌ ${table}.${column} - MISSING`);
      }
    }

    console.log(`\n📊 COLUMN SUMMARY:`);
    console.log(`Existing JSON columns: ${existingColumns.length}`);
    console.log(`Missing JSON columns: ${missingColumns.length}`);

    return {
      existingTables,
      nonExistingTables,
      existingColumns,
      missingColumns
    };

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await pool.end();
  }
}

checkExistingTables();
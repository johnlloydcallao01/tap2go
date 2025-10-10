require('dotenv').config();
const { Client } = require('pg');

async function checkSchemaSync() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get current merchants table schema
    const schemaQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      ORDER BY ordinal_position;
    `;

    const schemaResult = await client.query(schemaQuery);
    console.log('\n📋 Current Database Schema for merchants table:');
    console.log('='.repeat(80));
    
    const currentColumns = {};
    schemaResult.rows.forEach(row => {
      currentColumns[row.column_name] = {
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
        maxLength: row.character_maximum_length,
        precision: row.numeric_precision,
        scale: row.numeric_scale
      };
      
      console.log(`${row.column_name.padEnd(35)} | ${row.data_type.padEnd(20)} | ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Expected columns based on current code schema
    const expectedColumns = {
      // Core fields
      'id': { type: 'integer', nullable: false },
      'vendor_id': { type: 'integer', nullable: false },
      'outlet_name': { type: 'character varying', nullable: false },
      'outlet_code': { type: 'character varying', nullable: false },
      
      // Contact info group
      'contact_info_phone': { type: 'character varying', nullable: true },
      'contact_info_email': { type: 'character varying', nullable: true },
      'contact_info_manager_name': { type: 'character varying', nullable: true },
      'contact_info_manager_phone': { type: 'character varying', nullable: true },
      
      // Status fields
      'is_active': { type: 'boolean', nullable: true },
      'is_accepting_orders': { type: 'boolean', nullable: true },
      'operational_status': { type: 'character varying', nullable: true },
      
      // JSON fields
      'operating_hours': { type: 'jsonb', nullable: true },
      'special_hours': { type: 'jsonb', nullable: true },
      
      // Delivery settings group
      'delivery_settings_minimum_order_amount': { type: 'numeric', nullable: true },
      'delivery_settings_delivery_fee': { type: 'numeric', nullable: true },
      'delivery_settings_free_delivery_threshold': { type: 'numeric', nullable: true },
      'delivery_settings_estimated_delivery_time_minutes': { type: 'numeric', nullable: true },
      'delivery_settings_max_delivery_time_minutes': { type: 'numeric', nullable: true },
      
      // Media group
      'media_thumbnail_id': { type: 'integer', nullable: true },
      'media_store_front_image_id': { type: 'integer', nullable: true },
      'media_interior_images': { type: 'jsonb', nullable: true },
      'media_menu_images': { type: 'jsonb', nullable: true },
      
      // Additional info
      'description': { type: 'text', nullable: true },
      'special_instructions': { type: 'text', nullable: true },
      'tags': { type: 'jsonb', nullable: true },
      'active_address_id': { type: 'integer', nullable: true },
      
      // Denormalized geospatial fields
      'merchant_latitude': { type: 'numeric', nullable: true },
      'merchant_longitude': { type: 'numeric', nullable: true },
      'location_accuracy_radius': { type: 'numeric', nullable: true },
      
      // Delivery configuration
      'delivery_radius_meters': { type: 'numeric', nullable: true },
      'max_delivery_radius_meters': { type: 'numeric', nullable: true },
      'min_order_amount': { type: 'numeric', nullable: true },
      'delivery_fee_base': { type: 'numeric', nullable: true },
      'delivery_fee_per_km': { type: 'numeric', nullable: true },
      'free_delivery_threshold': { type: 'numeric', nullable: true },
      
      // Service areas & zones (JSON fields)
      'service_area': { type: 'jsonb', nullable: true },
      'priority_zones': { type: 'jsonb', nullable: true },
      'restricted_areas': { type: 'jsonb', nullable: true },
      'delivery_zones': { type: 'jsonb', nullable: true },
      
      // Performance metrics
      'avg_delivery_time_minutes': { type: 'numeric', nullable: true },
      'delivery_success_rate': { type: 'numeric', nullable: true },
      'peak_hours_multiplier': { type: 'numeric', nullable: true },
      
      // Business hours & availability
      'delivery_hours': { type: 'jsonb', nullable: true },
      'is_currently_delivering': { type: 'boolean', nullable: true },
      'next_available_slot': { type: 'timestamp with time zone', nullable: true },
      
      // Standard PayloadCMS fields
      'updated_at': { type: 'timestamp with time zone', nullable: false },
      'created_at': { type: 'timestamp with time zone', nullable: false }
    };

    console.log('\n🔍 Schema Comparison Analysis:');
    console.log('='.repeat(80));

    const missingColumns = [];
    const extraColumns = [];
    const typeMismatches = [];

    // Check for missing columns
    Object.keys(expectedColumns).forEach(expectedCol => {
      if (!currentColumns[expectedCol]) {
        missingColumns.push(expectedCol);
      } else {
        // Check type compatibility
        const expected = expectedColumns[expectedCol];
        const current = currentColumns[expectedCol];
        
        // Normalize type names for comparison
        const normalizeType = (type) => {
          if (type === 'character varying') return 'varchar';
          if (type === 'timestamp with time zone') return 'timestamptz';
          return type;
        };
        
        if (normalizeType(expected.type) !== normalizeType(current.type)) {
          typeMismatches.push({
            column: expectedCol,
            expected: expected.type,
            current: current.type
          });
        }
      }
    });

    // Check for extra columns
    Object.keys(currentColumns).forEach(currentCol => {
      if (!expectedColumns[currentCol]) {
        extraColumns.push(currentCol);
      }
    });

    // Report findings
    if (missingColumns.length > 0) {
      console.log('\n❌ MISSING COLUMNS (need to be added):');
      missingColumns.forEach(col => {
        console.log(`  - ${col} (${expectedColumns[col].type})`);
      });
    }

    if (extraColumns.length > 0) {
      console.log('\n⚠️  EXTRA COLUMNS (exist in DB but not in code):');
      extraColumns.forEach(col => {
        console.log(`  - ${col} (${currentColumns[col].type})`);
      });
    }

    if (typeMismatches.length > 0) {
      console.log('\n🔄 TYPE MISMATCHES:');
      typeMismatches.forEach(mismatch => {
        console.log(`  - ${mismatch.column}: expected ${mismatch.expected}, got ${mismatch.current}`);
      });
    }

    if (missingColumns.length === 0 && extraColumns.length === 0 && typeMismatches.length === 0) {
      console.log('\n✅ SCHEMA IS IN SYNC! No migration needed.');
    } else {
      console.log('\n🚨 SCHEMA SYNC REQUIRED! Migration needed to align database with code.');
    }

    console.log('\n📊 Summary:');
    console.log(`  - Expected columns: ${Object.keys(expectedColumns).length}`);
    console.log(`  - Current columns: ${Object.keys(currentColumns).length}`);
    console.log(`  - Missing columns: ${missingColumns.length}`);
    console.log(`  - Extra columns: ${extraColumns.length}`);
    console.log(`  - Type mismatches: ${typeMismatches.length}`);

  } catch (error) {
    console.error('❌ Error checking schema sync:', error);
  } finally {
    await client.end();
  }
}

checkSchemaSync();
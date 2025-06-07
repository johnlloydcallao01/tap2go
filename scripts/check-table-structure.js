#!/usr/bin/env node

/**
 * Check Table Structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure...\n');

  try {
    // Get table columns using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'blog_posts'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      // Fallback: try to get a sample record to see structure
      console.log('Using fallback method...');
      const { data: sample, error: sampleError } = await supabase
        .from('blog_posts')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Error:', sampleError);
        return;
      }

      if (sample && sample.length > 0) {
        console.log('📋 blog_posts columns (from sample):');
        Object.keys(sample[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof sample[0][column]}`);
        });
      } else {
        console.log('📋 No sample data available');
      }
    } else {
      console.log('📋 blog_posts table structure:');
      data.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTableStructure();

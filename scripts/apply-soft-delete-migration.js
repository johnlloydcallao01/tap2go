#!/usr/bin/env node

/**
 * Apply WordPress-Style Soft Delete Migration to Supabase
 * This script applies the soft delete migration programmatically
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role (admin privileges)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure these are set in .env.local:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function applyMigration() {
  try {
    console.log('🚀 Starting WordPress-style soft delete migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrate-supabase-soft-delete.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement
          });
          
          if (error) {
            // Try direct execution if RPC fails
            const { error: directError } = await supabase
              .from('_temp_migration')
              .select('*')
              .limit(1);
            
            // If table doesn't exist, we need to use a different approach
            console.log(`⚠️  RPC method not available, using alternative approach...`);
            
            // For critical statements, we'll log them for manual execution
            if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX')) {
              console.log(`📋 Please execute this manually in Supabase SQL Editor:`);
              console.log(`${statement};`);
              console.log('');
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} needs manual execution:`, err.message);
          console.log(`📋 SQL: ${statement};`);
          console.log('');
        }
      }
    }
    
    // Test the migration by checking if columns exist
    console.log('🔍 Verifying migration...');
    
    try {
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, deleted_at, deleted_by')
        .limit(1);
      
      if (postsError) {
        console.log('⚠️  Migration verification failed for blog_posts:', postsError.message);
        console.log('📋 Please run the migration SQL manually in Supabase SQL Editor');
      } else {
        console.log('✅ blog_posts table migration verified');
      }
      
      const { data: pages, error: pagesError } = await supabase
        .from('static_pages')
        .select('id, deleted_at, deleted_by')
        .limit(1);
      
      if (pagesError) {
        console.log('⚠️  Migration verification failed for static_pages:', pagesError.message);
        console.log('📋 Please run the migration SQL manually in Supabase SQL Editor');
      } else {
        console.log('✅ static_pages table migration verified');
      }
      
    } catch (verifyError) {
      console.log('⚠️  Migration verification failed:', verifyError.message);
      console.log('📋 Please run the migration SQL manually in Supabase SQL Editor');
    }
    
    console.log('');
    console.log('🎉 Migration process completed!');
    console.log('');
    console.log('📋 Manual Steps Required:');
    console.log('1. Go to your Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the contents of scripts/migrate-supabase-soft-delete.sql');
    console.log('3. Execute the SQL to complete the migration');
    console.log('');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('📋 Manual Migration Required:');
    console.log('1. Go to your Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the contents of scripts/migrate-supabase-soft-delete.sql');
    console.log('3. Execute the SQL to complete the migration');
    process.exit(1);
  }
}

// Run the migration
applyMigration();

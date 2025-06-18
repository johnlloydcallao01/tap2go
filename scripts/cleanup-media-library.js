#!/usr/bin/env node

/**
 * Media Library Cleanup Script for Supabase
 * Removes all media library tables, functions, triggers, and views
 * 
 * Usage: node scripts/cleanup-media-library.js
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

async function executeSQL(sql, description) {
  try {
    console.log(`🔄 ${description}...`);
    
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: sql 
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function cleanupMediaLibrary() {
  try {
    console.log('🚀 Starting Media Library Cleanup...\n');
    
    // Read the cleanup SQL file
    const cleanupPath = path.join(__dirname, 'cleanup-media-library.sql');
    
    if (!fs.existsSync(cleanupPath)) {
      console.error('❌ Cleanup SQL file not found:', cleanupPath);
      console.log('📋 Please run this manually in Supabase SQL Editor instead.');
      return false;
    }
    
    const cleanupSQL = fs.readFileSync(cleanupPath, 'utf8');
    
    // Split into individual statements and filter out comments
    const statements = cleanupSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        !stmt.includes('RAISE NOTICE') &&
        !stmt.includes('SELECT table_name') &&
        !stmt.includes('SELECT routine_name')
      );
    
    console.log(`📝 Found ${statements.length} cleanup statements to execute\n`);
    
    // Execute each statement
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        const success = await executeSQL(statement, `Statement ${i + 1}/${statements.length}`);
        if (success) successCount++;
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`✅ Successful: ${successCount}/${statements.length}`);
    
    if (successCount === statements.length) {
      console.log('\n🎉 Media Library cleanup completed successfully!');
      console.log('📋 All media library components have been removed from your Supabase database.');
    } else {
      console.log('\n⚠️  Some cleanup operations failed.');
      console.log('📋 Please check the errors above and run the remaining operations manually.');
    }
    
    return successCount === statements.length;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.log('\n📋 Manual Cleanup Required:');
    console.log('1. Go to your Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the contents of scripts/cleanup-media-library.sql');
    console.log('3. Execute the SQL to complete the cleanup');
    return false;
  }
}

async function verifyCleanup() {
  try {
    console.log('\n🔍 Verifying cleanup...');
    
    // Check for remaining media tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'media_%');
    
    if (tablesError) {
      console.log('⚠️  Could not verify table cleanup:', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log('⚠️  Some media tables still exist:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('✅ All media tables successfully removed');
    }
    
  } catch (error) {
    console.log('⚠️  Verification failed:', error.message);
  }
}

// Main execution
async function main() {
  const success = await cleanupMediaLibrary();
  
  if (success) {
    await verifyCleanup();
  }
  
  console.log('\n🔗 Supabase Dashboard:', `https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}`);
}

main().catch(console.error);

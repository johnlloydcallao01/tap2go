#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return false;
    }

    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection by checking if our tables exist
    const { data, error } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('📊 Database accessible');
    return true;

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});

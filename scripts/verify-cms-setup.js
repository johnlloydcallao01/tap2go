#!/usr/bin/env node

/**
 * Verify Supabase CMS Setup
 * Checks if all tables and data are properly created
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase CMS Setup...\n');

  const checks = [
    { name: 'Categories table', table: 'categories' },
    { name: 'Tags table', table: 'tags' },
    { name: 'Blog posts table', table: 'blog_posts' },
    { name: 'Static pages table', table: 'static_pages' },
    { name: 'Post categories relationships', table: 'post_categories' },
    { name: 'Post tags relationships', table: 'post_tags' }
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        allPassed = false;
      } else {
        console.log(`✅ ${check.name}: OK`);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
      allPassed = false;
    }
  }

  // Check for sample data
  console.log('\n📊 Checking sample data...');
  
  try {
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: tags } = await supabase.from('tags').select('*');
    const { data: posts } = await supabase.from('blog_posts').select('*');
    const { data: pages } = await supabase.from('static_pages').select('*');

    console.log(`📁 Categories: ${categories?.length || 0} found`);
    console.log(`🏷️  Tags: ${tags?.length || 0} found`);
    console.log(`📝 Blog posts: ${posts?.length || 0} found`);
    console.log(`📄 Static pages: ${pages?.length || 0} found`);

    if (categories?.length > 0 && tags?.length > 0) {
      console.log('✅ Sample data is present');
    } else {
      console.log('⚠️  No sample data found (this is optional)');
    }
  } catch (error) {
    console.log('❌ Error checking sample data:', error.message);
    allPassed = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 CMS Setup Verification: PASSED');
    console.log('\n✅ Your WordPress-style CMS is ready to use!');
    console.log('\n🚀 Next steps:');
    console.log('1. Import CMS operations: import { BlogPostOps } from "@/lib/supabase/cms-operations"');
    console.log('2. Start creating blog posts and pages');
    console.log('3. Check examples in: examples/cms-usage-examples.ts');
  } else {
    console.log('❌ CMS Setup Verification: FAILED');
    console.log('\n🔧 To fix issues:');
    console.log('1. Run: npm run supabase:setup');
    console.log('2. Or manually run SQL files in Supabase dashboard');
  }
}

verifySetup().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

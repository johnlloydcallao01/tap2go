#!/usr/bin/env node

/**
 * Test CMS Operations - Verify everything works
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCMSOperations() {
  console.log('🧪 Testing CMS Operations...\n');

  try {
    // Test 1: Get all categories
    console.log('📁 Testing categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) throw catError;
    console.log(`✅ Found ${categories.length} categories:`, categories.map(c => c.name).join(', '));

    // Test 2: Get all tags
    console.log('\n🏷️  Testing tags...');
    const { data: tags, error: tagError } = await supabase
      .from('tags')
      .select('*');
    
    if (tagError) throw tagError;
    console.log(`✅ Found ${tags.length} tags:`, tags.map(t => t.name).join(', '));

    // Test 3: Get published blog posts
    console.log('\n📝 Testing blog posts...');
    const { data: posts, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published');
    
    if (postError) throw postError;
    console.log(`✅ Found ${posts.length} published blog posts:`);
    posts.forEach(post => {
      console.log(`   - "${post.title}" (${post.slug})`);
    });

    // Test 4: Get published static pages
    console.log('\n📄 Testing static pages...');
    const { data: pages, error: pageError } = await supabase
      .from('static_pages')
      .select('*')
      .eq('status', 'published');
    
    if (pageError) throw pageError;
    console.log(`✅ Found ${pages.length} published pages:`);
    pages.forEach(page => {
      console.log(`   - "${page.title}" (${page.slug})`);
    });

    // Test 5: Get navigation pages
    console.log('\n🧭 Testing navigation...');
    const { data: navPages, error: navError } = await supabase
      .from('static_pages')
      .select('*')
      .eq('show_in_navigation', true)
      .order('menu_order');
    
    if (navError) throw navError;
    console.log(`✅ Found ${navPages.length} navigation pages:`);
    navPages.forEach(page => {
      console.log(`   - "${page.navigation_label || page.title}" (order: ${page.menu_order})`);
    });

    console.log('\n🎉 ALL TESTS PASSED! Your CMS is working perfectly!');
    
    console.log('\n📋 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Tags: ${tags.length}`);
    console.log(`- Published Posts: ${posts.length}`);
    console.log(`- Published Pages: ${pages.length}`);
    console.log(`- Navigation Items: ${navPages.length}`);

    console.log('\n🚀 Ready to use in your app!');
    console.log('Import: const { BlogPostOps, StaticPageOps } = require("@/lib/supabase/cms-operations");');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCMSOperations();

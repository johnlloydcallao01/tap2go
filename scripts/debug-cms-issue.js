#!/usr/bin/env node

/**
 * DEBUG CMS ISSUE - Find the real problem
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 DEBUGGING CMS ISSUE...\n');

console.log('Environment variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCMSIssue() {
  try {
    console.log('\n📋 Step 1: Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection working');

    console.log('\n📋 Step 2: Testing minimal post creation...');
    const minimalPost = {
      title: 'Debug Test Post',
      slug: 'debug-test-post-' + Date.now(),
      content: 'Debug content',
      author_name: 'Debug Admin',
      status: 'draft'
    };

    console.log('Attempting to create:', minimalPost);

    const { data: newPost, error: createError } = await supabase
      .from('blog_posts')
      .insert([minimalPost])
      .select()
      .single();

    if (createError) {
      console.error('\n❌ CREATE FAILED:');
      console.error('Message:', createError.message);
      console.error('Code:', createError.code);
      console.error('Details:', createError.details);
      console.error('Hint:', createError.hint);
      
      // Try to get table info
      console.log('\n🔍 Checking table structure...');
      const { data: sample } = await supabase
        .from('blog_posts')
        .select('*')
        .limit(1);
      
      if (sample && sample[0]) {
        console.log('\n📋 Available columns:');
        Object.keys(sample[0]).forEach(col => {
          console.log(`  - ${col}`);
        });
      }
      
      return;
    }

    console.log('\n✅ POST CREATED SUCCESSFULLY!');
    console.log('ID:', newPost.id);
    console.log('Title:', newPost.title);
    console.log('Status:', newPost.status);

    console.log('\n📋 Step 3: Testing trash operation...');
    const { data: trashedPost, error: trashError } = await supabase
      .from('blog_posts')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'trash'
      })
      .eq('id', newPost.id)
      .select()
      .single();

    if (trashError) {
      console.error('\n❌ TRASH FAILED:');
      console.error('Message:', trashError.message);
      console.error('Code:', trashError.code);
      console.error('Details:', trashError.details);
      return;
    }

    console.log('\n✅ TRASH OPERATION SUCCESSFUL!');
    console.log('Status:', trashedPost.status);
    console.log('Deleted at:', trashedPost.deleted_at);

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await supabase
      .from('blog_posts')
      .delete()
      .eq('id', newPost.id);

    console.log('\n🎉 ALL OPERATIONS WORKING!');
    console.log('\n📋 CONCLUSION:');
    console.log('✅ Database connection: Working');
    console.log('✅ Post creation: Working');
    console.log('✅ Trash operation: Working');
    console.log('\n💡 The issue is likely in the frontend code, not the database!');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error);
  }
}

debugCMSIssue();

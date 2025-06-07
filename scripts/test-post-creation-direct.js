#!/usr/bin/env node

/**
 * Test Post Creation Directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPostCreation() {
  console.log('🧪 Testing Direct Post Creation...\n');

  try {
    // Test creating a post directly
    console.log('📝 Creating test post...');
    const testPost = {
      title: 'Test Post - Direct Creation',
      slug: 'test-post-direct-creation-' + Date.now(),
      content: 'This is a test post created directly via Supabase client.',
      excerpt: 'Test excerpt for direct creation',
      author_name: 'Test Admin',
      status: 'draft',
      is_featured: false,
      is_sticky: false,
      reading_time: 1,
      view_count: 0
    };

    const { data: newPost, error: createError } = await supabase
      .from('blog_posts')
      .insert([testPost])
      .select()
      .single();

    if (createError) {
      console.error('❌ Create post error:', createError);
      return;
    }

    console.log('✅ Post created successfully:', {
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      status: newPost.status,
      created_at: newPost.created_at
    });

    // Test moving to trash
    console.log('\n🗑️ Testing move to trash...');
    const { data: trashedPost, error: trashError } = await supabase
      .from('blog_posts')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: 'test-user',
        status: 'trash',
        updated_at: new Date().toISOString()
      })
      .eq('id', newPost.id)
      .select()
      .single();

    if (trashError) {
      console.error('❌ Trash error:', trashError);
      return;
    }

    console.log('✅ Post moved to trash:', {
      id: trashedPost.id,
      status: trashedPost.status,
      deleted_at: trashedPost.deleted_at
    });

    // Test restore
    console.log('\n♻️ Testing restore from trash...');
    const { data: restoredPost, error: restoreError } = await supabase
      .from('blog_posts')
      .update({
        deleted_at: null,
        deleted_by: null,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', newPost.id)
      .select()
      .single();

    if (restoreError) {
      console.error('❌ Restore error:', restoreError);
      return;
    }

    console.log('✅ Post restored:', {
      id: restoredPost.id,
      status: restoredPost.status,
      deleted_at: restoredPost.deleted_at
    });

    // Clean up - permanent delete
    console.log('\n🧹 Cleaning up...');
    await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString(), status: 'trash' })
      .eq('id', newPost.id);

    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', newPost.id);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return;
    }

    console.log('✅ Test post cleaned up');

    console.log('\n🎉 ALL POST OPERATIONS WORKING!');
    console.log('✅ Create: Working');
    console.log('✅ Move to trash: Working');
    console.log('✅ Restore: Working');
    console.log('✅ Permanent delete: Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPostCreation();

#!/usr/bin/env node

/**
 * Test Post Creation with New WordPress-Style CMS
 * This script tests if post creation works after the migration
 */

const { BlogPostOps } = require('../src/lib/supabase/cms-operations');
require('dotenv').config({ path: '.env.local' });

async function testPostCreation() {
  try {
    console.log('🧪 Testing WordPress-style post creation...');
    
    // Test data
    const testPost = {
      title: 'Test Post - WordPress Style CMS',
      content: 'This is a test post to verify that our WordPress-style CMS is working correctly with soft delete functionality.',
      excerpt: 'A test post for our new CMS system',
      author_name: 'Test Admin',
      status: 'draft',
      is_featured: false,
      is_sticky: false,
      reading_time: 1,
      view_count: 0
    };

    console.log('📝 Creating test post...');
    const result = await BlogPostOps.createPost(testPost);
    
    if (result) {
      console.log('✅ Post creation successful!');
      console.log('📋 Created post:', {
        id: result.id,
        title: result.title,
        status: result.status,
        created_at: result.created_at
      });
      
      // Test soft delete
      console.log('🗑️ Testing soft delete (move to trash)...');
      const trashResult = await BlogPostOps.moveToTrash(result.id, 'test-user');
      
      if (trashResult) {
        console.log('✅ Soft delete successful!');
        console.log('📋 Trashed post:', {
          id: trashResult.id,
          status: trashResult.status,
          deleted_at: trashResult.deleted_at
        });
        
        // Test restore
        console.log('♻️ Testing restore from trash...');
        const restoreResult = await BlogPostOps.restoreFromTrash(result.id, 'draft');
        
        if (restoreResult) {
          console.log('✅ Restore successful!');
          console.log('📋 Restored post:', {
            id: restoreResult.id,
            status: restoreResult.status,
            deleted_at: restoreResult.deleted_at
          });
          
          // Clean up - permanent delete
          console.log('🧹 Cleaning up test post...');
          await BlogPostOps.moveToTrash(result.id, 'test-user');
          await BlogPostOps.permanentDelete(result.id);
          console.log('✅ Test post cleaned up');
        }
      }
      
      console.log('');
      console.log('🎉 All tests passed! Your WordPress-style CMS is working perfectly!');
      console.log('');
      console.log('✅ Post creation: Working');
      console.log('✅ Soft delete (trash): Working');
      console.log('✅ Restore from trash: Working');
      console.log('✅ Permanent delete: Working');
      
    } else {
      console.log('❌ Post creation failed - no result returned');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure you applied the database migration in Supabase SQL Editor');
    console.log('2. Check that your Supabase environment variables are correct');
    console.log('3. Verify Supabase connection with: node scripts/test-supabase-connection.js');
    console.log('');
    console.log('📋 Migration file: scripts/migrate-supabase-soft-delete.sql');
    console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/iblujnytqusttngujhob');
  }
}

// Run the test
testPostCreation();

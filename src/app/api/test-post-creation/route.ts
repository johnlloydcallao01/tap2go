import { NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

/**
 * Test Post Creation API
 * Specifically tests the blog post creation functionality
 * to isolate production issues
 */
export async function GET() {
  try {
    console.log('🧪 Testing post creation functionality...');
    
    // Test 1: Basic database connection
    console.log('Test 1: Basic database connection...');
    const connectionTest = await db.sql('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connection successful');
    
    // Test 2: Check if blog_posts table exists
    console.log('Test 2: Checking blog_posts table...');
    const tableCheck = await db.sql(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' 
      ORDER BY ordinal_position
    `);
    console.log('✅ Blog posts table structure verified');
    
    // Test 3: Try to insert a test post
    console.log('Test 3: Testing post insertion...');
    const testSlug = `test-post-${Date.now()}`;
    const insertResult = await db.sql(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, status,
        author_name, author_bio, featured_image_url,
        categories, tags, is_featured, is_sticky,
        reading_time, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, title, slug, status, created_at
    `, [
      'Test Post Creation',
      testSlug,
      'This is a test post to verify the creation functionality works in production.',
      'Test excerpt',
      'draft',
      'Test Admin',
      '',
      '',
      JSON.stringify(['test']),
      JSON.stringify(['testing']),
      false,
      false,
      5,
      null
    ]);
    
    const createdPost = insertResult[0];
    console.log('✅ Test post created successfully:', createdPost);
    
    // Test 4: Clean up - delete the test post
    console.log('Test 4: Cleaning up test post...');
    await db.sql('DELETE FROM blog_posts WHERE slug = $1', [testSlug]);
    console.log('✅ Test post cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'All post creation tests passed successfully',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...'
      },
      tests: {
        connectionTest: connectionTest[0],
        tableStructure: tableCheck.length > 0 ? 'Table exists with columns' : 'Table not found',
        postCreation: createdPost,
        cleanup: 'Completed'
      }
    });
    
  } catch (error) {
    console.error('❌ Post creation test failed:', error);
    
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...'
      },
      timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json({
      success: false,
      message: 'Post creation test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails
    }, { status: 500 });
  }
}

/**
 * POST - Test the actual post creation endpoint logic
 */
export async function POST() {
  try {
    console.log('🧪 Testing POST request for blog post creation...');
    
    const testPostData = {
      title: `Test Post ${Date.now()}`,
      content: 'This is a comprehensive test of the post creation functionality in production environment.',
      excerpt: 'Test post excerpt for production testing',
      author_name: 'Test Admin',
      status: 'draft'
    };
    
    // Generate slug
    const slug = testPostData.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    console.log('📝 Test post data prepared:', { title: testPostData.title, slug });
    
    // Insert using the same logic as the main API
    const insertResult = await db.sql(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, status,
        author_name, author_bio, featured_image_url,
        categories, tags, is_featured, is_sticky,
        reading_time, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, title, slug, content, excerpt, status,
                featured_image_url, author_name, created_at, updated_at
    `, [
      testPostData.title,
      slug,
      testPostData.content,
      testPostData.excerpt,
      testPostData.status,
      testPostData.author_name,
      '',
      '',
      JSON.stringify([]),
      JSON.stringify([]),
      false,
      false,
      5,
      null
    ]);
    
    const post = insertResult[0];
    console.log('✅ Test post created via POST test:', post.id);
    
    // Clean up
    await db.sql('DELETE FROM blog_posts WHERE id = $1', [post.id]);
    console.log('✅ Test post cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'POST test completed successfully',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        created_at: post.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ POST test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'POST test failed',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}

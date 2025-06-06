import { NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

/**
 * Debug endpoint to check database schema and data
 * This will help diagnose why posts aren't showing in production
 */
export async function GET() {
  try {
    console.log('🔍 Starting database debug...');

    // Check if blog_posts table exists and get its structure
    const tableInfo = await db.sql(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_posts'
      ORDER BY ordinal_position
    `) as ColumnInfo[];

    console.log('📊 Table structure:', tableInfo);

    // Check if there are any posts at all (ignoring deleted_at for now)
    const allPosts = await db.sql(`
      SELECT id, title, status, created_at, 
             CASE WHEN deleted_at IS NULL THEN 'active' ELSE 'deleted' END as delete_status
      FROM blog_posts 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('📝 All posts:', allPosts);

    // Check posts without deleted_at filter
    const postsWithoutFilter = await db.sql(`
      SELECT COUNT(*) as total_count,
             COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
             COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
      FROM blog_posts
    `);

    console.log('📊 Posts without filter:', postsWithoutFilter);

    // Check posts with deleted_at filter
    const postsWithFilter = await db.sql(`
      SELECT COUNT(*) as total_count,
             COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
             COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
      FROM blog_posts
      WHERE deleted_at IS NULL
    `);

    console.log('📊 Posts with deleted_at filter:', postsWithFilter);

    // Test the exact query used by the GET endpoint
    const testQuery = `
      SELECT 
        id, title, slug, content, excerpt, status,
        featured_image_url, author_name, created_at, updated_at
      FROM blog_posts 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const testResults = await db.sql(testQuery);
    console.log('🧪 Test query results:', testResults);

    return NextResponse.json({
      success: true,
      debug: {
        environment: {
          isVercel: process.env.VERCEL === '1',
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
          dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...'
        },
        tableStructure: tableInfo,
        allPosts: allPosts,
        countsWithoutFilter: postsWithoutFilter[0],
        countsWithFilter: postsWithFilter[0],
        testQueryResults: testResults,
        hasDeletedAtColumn: tableInfo.some((col: ColumnInfo) => col.column_name === 'deleted_at')
      }
    });

  } catch (error: unknown) {
    console.error('❌ Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: {
          isVercel: process.env.VERCEL === '1',
          nodeEnv: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL
        }
      }
    }, { status: 500 });
  }
}

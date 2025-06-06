import { NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

/**
 * Simple connection test for production debugging
 * Professional diagnostic endpoint for Vercel deployment issues
 */
export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const connectionTest = await db.sql('SELECT NOW() as current_time, version() as pg_version');
    
    // Test blog_posts table
    const tableTest = await db.sql(`
      SELECT COUNT(*) as total_posts,
             COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
             COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts
      FROM blog_posts
    `);
    
    // Test sample data
    const samplePosts = await db.sql(`
      SELECT id, title, status, created_at 
      FROM blog_posts 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasUnpooledUrl: !!process.env.DATABASE_URL_UNPOOLED,
        timestamp: new Date().toISOString()
      },
      connectionTest: connectionTest[0],
      tableStats: tableTest[0],
      samplePosts: samplePosts
    });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasUnpooledUrl: !!process.env.DATABASE_URL_UNPOOLED,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

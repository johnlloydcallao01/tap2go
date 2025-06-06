import { NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

/**
 * Debug API Route for Blog Posts
 * Provides detailed information about the database state and posts
 * Uses only non-parameterized queries to avoid Vercel issues
 */

interface ConnectionTest {
  current_time: string;
  db_version: string;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SamplePost {
  id: number;
  title: string;
  slug?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface QueryResult {
  success: boolean;
  count?: number;
  posts?: SamplePost[];
  error?: string;
}

interface StatsResult {
  success: boolean;
  stats?: {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    trashed_posts: number;
    total_views: number;
  };
  error?: string;
}

export async function GET() {
  try {
    console.log('🔍 DEBUG /api/debug/posts - Starting diagnostic...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasUnpooledUrl: !!process.env.DATABASE_URL_UNPOOLED,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
      },
      database: {
        connectionTest: null as ConnectionTest | { error: string } | null,
        tableExists: false,
        tableStructure: null as ColumnInfo[] | { error: string } | null,
        totalPosts: 0,
        samplePosts: [] as SamplePost[] | { error: string }[],
        columnInfo: null as ColumnInfo[] | { error: string } | null,
      },
      queries: {
        basicSelect: null as QueryResult | null,
        withDeletedAt: null as QueryResult | null,
        statsQuery: null as StatsResult | null,
      }
    };

    // Test 1: Basic connection (no parameters)
    try {
      const connectionTest = await db.sql<ConnectionTest>('SELECT NOW() as current_time, version() as db_version');
      diagnostics.database.connectionTest = connectionTest[0];
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      diagnostics.database.connectionTest = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 2: Check if blog_posts table exists (no parameters)
    try {
      const tableCheck = await db.sql<ColumnInfo>(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        ORDER BY ordinal_position
      `);

      diagnostics.database.tableExists = tableCheck.length > 0;
      diagnostics.database.columnInfo = tableCheck;
      console.log(`✅ Table structure check: ${tableCheck.length} columns found`);
    } catch (error) {
      console.error('❌ Table structure check failed:', error);
      diagnostics.database.columnInfo = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 3: Count total posts (no parameters)
    try {
      const countResult = await db.sql<{ total: number }>('SELECT COUNT(*) as total FROM blog_posts');
      diagnostics.database.totalPosts = parseInt(String(countResult[0]?.total || 0));
      console.log(`✅ Total posts count: ${diagnostics.database.totalPosts}`);
    } catch (error) {
      console.error('❌ Count query failed:', error);
      diagnostics.database.totalPosts = -1;
    }

    // Test 4: Get sample posts (no parameters)
    try {
      const samplePosts = await db.sql<SamplePost>(`
        SELECT id, title, status, created_at, updated_at, deleted_at
        FROM blog_posts
        ORDER BY created_at DESC
        LIMIT 5
      `);
      diagnostics.database.samplePosts = samplePosts;
      console.log(`✅ Sample posts retrieved: ${samplePosts.length}`);
    } catch (error) {
      console.error('❌ Sample posts query failed:', error);
      diagnostics.database.samplePosts = [{ error: error instanceof Error ? error.message : 'Unknown error' }];
    }

    // Test 5: Test basic SELECT query (same as API, no parameters)
    try {
      const basicQuery = await db.sql<SamplePost>(`
        SELECT id, title, slug, status, created_at
        FROM blog_posts
        WHERE 1=1
        ORDER BY created_at DESC
        LIMIT 10
      `);
      diagnostics.queries.basicSelect = {
        success: true,
        count: basicQuery.length,
        posts: basicQuery
      };
      console.log(`✅ Basic select query: ${basicQuery.length} posts`);
    } catch (error) {
      console.error('❌ Basic select query failed:', error);
      diagnostics.queries.basicSelect = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 6: Test with deleted_at filter (no parameters)
    try {
      const deletedAtQuery = await db.sql<SamplePost>(`
        SELECT id, title, slug, status, created_at, deleted_at
        FROM blog_posts
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 10
      `);
      diagnostics.queries.withDeletedAt = {
        success: true,
        count: deletedAtQuery.length,
        posts: deletedAtQuery
      };
      console.log(`✅ Deleted_at filter query: ${deletedAtQuery.length} posts`);
    } catch (error) {
      console.error('❌ Deleted_at filter query failed:', error);
      diagnostics.queries.withDeletedAt = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 7: Test stats query (no parameters)
    try {
      const statsQuery = await db.sql<{
        total_posts: number;
        published_posts: number;
        draft_posts: number;
        trashed_posts: number;
        total_views: number;
      }>(`
        SELECT
          COUNT(*) as total_posts,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
          COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as trashed_posts,
          COALESCE(SUM(view_count), 0) as total_views
        FROM blog_posts
      `);
      diagnostics.queries.statsQuery = {
        success: true,
        stats: statsQuery[0]
      };
      console.log(`✅ Stats query successful`);
    } catch (error) {
      console.error('❌ Stats query failed:', error);
      diagnostics.queries.statsQuery = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnostic completed',
      diagnostics
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

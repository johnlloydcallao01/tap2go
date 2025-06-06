/**
 * Database Test API Route - Custom Database Testing
 * Tests Direct SQL connections for the custom CMS
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

export async function GET() {
  try {
    const testResults = {
      directSQL: { status: 'unknown', data: null as Record<string, unknown> | null, error: null as string | null },
      performance: { sqlTime: 0 }
    };

    // Test Direct SQL connection
    try {
      const sqlStart = Date.now();
      const sqlResult = await db.sql('SELECT NOW() as current_time, version() as db_version');
      const sqlEnd = Date.now();

      testResults.directSQL.status = 'success';
      testResults.directSQL.data = sqlResult[0];
      testResults.performance.sqlTime = sqlEnd - sqlStart;
    } catch (error) {
      testResults.directSQL.status = 'error';
      testResults.directSQL.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Overall status
    const overallSuccess = testResults.directSQL.status === 'success';

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? 'Custom database connection successful' : 'Database connection failed',
      data: {
        connectionTests: testResults,
        performance: {
          sqlLatency: `${testResults.performance.sqlTime}ms`
        },
        timestamp: new Date().toISOString()
      }
    }, { status: overallSuccess ? 200 : 500 });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'seed':
        // Seed database with sample data
        try {
          const seedResult = await seedDatabase();
          return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data: seedResult
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Seeding failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      case 'test_table':
        // Test if blog_posts table exists
        try {
          const tableExists = await db.sql(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables
              WHERE table_schema = 'public'
              AND table_name = 'blog_posts'
            );
          `);
          return NextResponse.json({
            success: true,
            message: 'Table check completed',
            data: { tableExists: tableExists[0]?.exists || false }
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Table check failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Available actions: seed, test_table' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Database action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database action failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to seed database
async function seedDatabase() {
  // Create sample blog posts for testing
  const seedData = {
    blogPosts: 0
  };

  // Check if sample post already exists
  const existingPost = await db.sql(`
    SELECT id FROM blog_posts WHERE slug = $1
  `, ['welcome-to-tap2go']);

  if (existingPost.length === 0) {
    // Create sample blog post using direct SQL
    await db.sql(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, status,
        author_name, author_email, published_at,
        categories, tags, seo_title, seo_description,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      )
    `, [
      'Welcome to Tap2Go',
      'welcome-to-tap2go',
      'Welcome to Tap2Go, your premier food delivery platform. This is a sample blog post to test the CMS functionality.',
      'Welcome to Tap2Go, your premier food delivery platform.',
      'published',
      'Tap2Go Team',
      'admin@tap2go.com',
      new Date(),
      JSON.stringify(['announcements', 'company']),
      JSON.stringify(['welcome', 'launch', 'food-delivery']),
      'Welcome to Tap2Go - Food Delivery Platform',
      'Discover Tap2Go, the premier food delivery platform connecting you with your favorite restaurants.'
    ]);
    seedData.blogPosts++;
  }

  return seedData;
}

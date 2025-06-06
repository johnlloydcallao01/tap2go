/**
 * Database Test API Route - Hybrid Database Testing
 * Tests both Prisma ORM and Direct SQL connections
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

export async function GET() {
  try {
    const testResults = {
      prisma: { status: 'unknown', data: null as Record<string, unknown> | null, error: null as string | null },
      directSQL: { status: 'unknown', data: null as Record<string, unknown> | null, error: null as string | null },
      performance: { prismaTime: 0, sqlTime: 0 }
    };

    // Test Prisma ORM connection
    try {
      const prismaStart = Date.now();
      const prismaResult = await db.orm.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
      const prismaEnd = Date.now();

      testResults.prisma.status = 'success';
      testResults.prisma.data = prismaResult as Record<string, unknown>;
      testResults.performance.prismaTime = prismaEnd - prismaStart;
    } catch (error) {
      testResults.prisma.status = 'error';
      testResults.prisma.error = error instanceof Error ? error.message : 'Unknown error';
    }

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
    const overallSuccess = testResults.prisma.status === 'success' && testResults.directSQL.status === 'success';

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? 'Hybrid database connection successful' : 'Some database connections failed',
      data: {
        connectionTests: testResults,
        performance: {
          prismaLatency: `${testResults.performance.prismaTime}ms`,
          sqlLatency: `${testResults.performance.sqlTime}ms`,
          difference: `${Math.abs(testResults.performance.prismaTime - testResults.performance.sqlTime)}ms`,
          faster: testResults.performance.prismaTime < testResults.performance.sqlTime ? 'Prisma' : 'Direct SQL'
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
      case 'migrate':
        // Run Prisma migrations
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma migrate deploy', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Database migrations completed successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      case 'generate':
        // Generate Prisma client
        try {
          execSync('npx prisma generate', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Prisma client generated successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Client generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

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

      case 'reset':
        // Reset database (development only)
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json(
            { success: false, error: 'Database reset only allowed in development' },
            { status: 403 }
          );
        }
        
        try {
          execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
          return NextResponse.json({
            success: true,
            message: 'Database reset successfully'
          });
        } catch (error) {
          return NextResponse.json(
            { success: false, error: 'Reset failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
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

  // Create sample blog post
  await db.orm.blogPost.upsert({
    where: { slug: 'welcome-to-tap2go' },
    update: {},
    create: {
      title: 'Welcome to Tap2Go',
      slug: 'welcome-to-tap2go',
      content: 'Welcome to Tap2Go, your premier food delivery platform. This is a sample blog post to test the CMS functionality.',
      excerpt: 'Welcome to Tap2Go, your premier food delivery platform.',
      status: 'published',
      authorName: 'Tap2Go Team',
      authorEmail: 'admin@tap2go.com',
      publishedAt: new Date(),
      categories: ['announcements', 'company'],
      tags: ['welcome', 'launch', 'food-delivery'],
      seoTitle: 'Welcome to Tap2Go - Food Delivery Platform',
      seoDescription: 'Discover Tap2Go, the premier food delivery platform connecting you with your favorite restaurants.'
    }
  });
  seedData.blogPosts++;

  return seedData;
}

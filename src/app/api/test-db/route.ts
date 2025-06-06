import { NextResponse } from 'next/server';
import { db } from '@/lib/database/hybrid-client';

/**
 * Test Database Connection API
 * Simple endpoint to test if database connection works in production
 */
export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await db.sql('SELECT NOW() as current_time, version() as db_version');
    
    console.log('✅ Database connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL
      },
      data: result[0]
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        isVercel: process.env.VERCEL === '1',
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL
      }
    }, { status: 500 });
  }
}

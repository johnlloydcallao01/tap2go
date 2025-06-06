/**
 * Neon Database Test API Route
 * Tests the Neon PostgreSQL connection and provides database information
 */

import { NextRequest, NextResponse } from 'next/server';
import { neonClient } from '@/lib/neon/client';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await neonClient.testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          message: 'Could not connect to Neon PostgreSQL database'
        },
        { status: 500 }
      );
    }

    // Get database information
    const dbInfo = await neonClient.getDatabaseInfo();
    
    return NextResponse.json({
      success: true,
      message: 'Neon database connection successful',
      data: {
        isConnected: true,
        database: {
          version: dbInfo.version,
          size: dbInfo.size,
          tableCount: Array.isArray(dbInfo.tables) ? dbInfo.tables.length : 0,
          tables: Array.isArray(dbInfo.tables) ? dbInfo.tables.map((t: Record<string, unknown>) => t.name) : [],
          connectionString: dbInfo.connectionString
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Neon test API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_schema':
        await neonClient.createCMSSchema();
        return NextResponse.json({
          success: true,
          message: 'CMS schema created successfully'
        });

      case 'drop_schema':
        // Only allow in development
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json(
            { success: false, error: 'Schema drop only allowed in development' },
            { status: 403 }
          );
        }
        
        await neonClient.dropCMSSchema();
        return NextResponse.json({
          success: true,
          message: 'CMS schema dropped successfully'
        });

      case 'test_query':
        const testResult = await neonClient.query('SELECT NOW() as current_time, version() as db_version');
        return NextResponse.json({
          success: true,
          message: 'Test query executed successfully',
          data: testResult[0]
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Neon test POST API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

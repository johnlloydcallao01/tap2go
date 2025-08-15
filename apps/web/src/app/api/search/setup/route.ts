// Bonsai Elasticsearch Setup API
// POST /api/search/setup - Initialize indices and sync data

import { NextRequest, NextResponse } from 'next/server';
import { testBonsaiConnection, getBonsaiClusterInfo, initializeBonsaiIndices } from '@/lib/bonsai';
// Firestore sync removed - use PayloadCMS collections instead

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'test-connection':
        return await handleTestConnection();
      
      case 'initialize':
        return await handleInitialize();
      
      case 'sync-data':
        return await handleSyncData();
      
      case 'check-status':
        return await handleCheckStatus();
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            message: 'Valid actions: test-connection, initialize, sync-data, check-status'
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Setup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Test Bonsai connection
async function handleTestConnection() {
  try {
    const isConnected = await testBonsaiConnection();
    
    if (isConnected) {
      const clusterInfo = await getBonsaiClusterInfo();
      return NextResponse.json({
        success: true,
        message: 'Bonsai connection successful',
        data: {
          connected: true,
          cluster: clusterInfo
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Bonsai connection failed',
        data: { connected: false }
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Initialize Bonsai indices
async function handleInitialize() {
  try {
    // Test connection first
    const isConnected = await testBonsaiConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to Bonsai cluster');
    }

    // Initialize indices
    await initializeBonsaiIndices();

    return NextResponse.json({
      success: true,
      message: 'Bonsai indices initialized successfully',
      data: {
        indices: ['tap2go_restaurants'],
        status: 'ready'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Initialization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Sync data from Firestore to Bonsai
async function handleSyncData() {
  try {
    // Test connection first
    const isConnected = await testBonsaiConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to Bonsai cluster');
    }

    // Initialize indices if needed
    await initializeBonsaiIndices();

    // Sync all restaurants
    const syncResult = await syncAllRestaurantsToBonsai();

    return NextResponse.json({
      success: true,
      message: 'Data sync completed',
      data: {
        syncResult,
        status: syncResult.failed === 0 ? 'success' : 'partial'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Data sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Check sync status
async function handleCheckStatus() {
  try {
    const status = await checkSyncStatus();

    return NextResponse.json({
      success: true,
      message: 'Status check completed',
      data: {
        firestore: {
          count: status.firestoreCount,
          source: 'Firestore database'
        },
        bonsai: {
          count: status.bonsaiCount,
          source: 'Bonsai search index'
        },
        sync: {
          inSync: status.inSync,
          status: status.inSync ? 'synchronized' : 'out-of-sync'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Status check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for quick status check
export async function GET() {
  try {
    const isConnected = await testBonsaiConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        service: 'Bonsai Elasticsearch',
        status: isConnected ? 'connected' : 'disconnected',
        endpoints: {
          setup: 'POST /api/search/setup',
          search: 'GET /api/search/restaurants',
          suggestions: 'GET /api/search/suggestions'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Service check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

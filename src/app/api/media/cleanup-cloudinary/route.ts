/**
 * API endpoint to process Cloudinary cleanup queue
 * This endpoint processes files that need to be deleted from Cloudinary
 * when they are deleted directly from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryCleanupService } from '@/lib/services/cloudinaryCleanupService';

export async function POST(request: NextRequest) {
  try {
    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { 
      batchSize = 10, 
      retryFailed = false, 
      maxRetries = 3,
      cleanupOld = false,
      daysOld = 30
    } = body;

    const cleanupService = CloudinaryCleanupService.getInstance();

    // Retry failed items if requested
    if (retryFailed) {
      const retriedCount = await cleanupService.retryFailedCleanups(maxRetries);
      console.log(`🔄 Retried ${retriedCount} failed cleanup items`);
    }

    // Clean up old records if requested
    if (cleanupOld) {
      const cleanedCount = await cleanupService.cleanupOldRecords(daysOld);
      console.log(`🧹 Cleaned up ${cleanedCount} old records`);
    }

    // Process the cleanup queue
    const result = await cleanupService.processCleanupQueue(batchSize);

    // Get current queue statistics
    const stats = await cleanupService.getQueueStats();

    return NextResponse.json({
      success: true,
      message: 'Cloudinary cleanup queue processed successfully',
      data: {
        batch_result: result,
        queue_stats: stats,
        options: {
          batchSize,
          retryFailed,
          maxRetries,
          cleanupOld,
          daysOld
        }
      }
    });

  } catch (error) {
    console.error('Cloudinary cleanup API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Cleanup failed';
    
    return NextResponse.json(
      { 
        error: 'Cleanup failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cleanupService = CloudinaryCleanupService.getInstance();
    
    // Get current queue statistics
    const stats = await cleanupService.getQueueStats();

    return NextResponse.json({
      success: true,
      message: 'Cloudinary cleanup queue statistics',
      data: {
        queue_stats: stats
      }
    });

  } catch (error) {
    console.error('Cloudinary cleanup stats API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get stats';
    
    return NextResponse.json(
      { 
        error: 'Failed to get stats',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

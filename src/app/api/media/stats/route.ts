import { NextRequest, NextResponse } from 'next/server';
import { MediaUsageService } from '@/lib/services/mediaUsageService';

/**
 * Media Library Statistics API
 * GET /api/media/stats - Get usage statistics and analytics
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnused = searchParams.get('include_unused') === 'true';
    const unusedDays = searchParams.get('unused_days');

    const mediaUsageService = MediaUsageService.getInstance();
    
    // Get basic usage statistics
    const stats = await mediaUsageService.getUsageStats();
    
    // Get unused files if requested
    let unusedFiles: unknown[] = [];
    if (includeUnused) {
      const days = unusedDays ? parseInt(unusedDays) : undefined;
      unusedFiles = await mediaUsageService.findUnusedFiles(days);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        ...(includeUnused && { unused_files: unusedFiles }),
      },
    });

  } catch (error) {
    console.error('Error fetching media stats:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
    
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

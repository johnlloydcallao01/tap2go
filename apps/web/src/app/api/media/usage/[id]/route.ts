import { NextRequest, NextResponse } from 'next/server';
import { MediaUsageService } from '@/lib/services/mediaUsageService';

/**
 * Individual Media File Usage API
 * GET /api/media/usage/[id] - Get usage for a specific media file
 */

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const mediaFileId = parseInt(id);
    
    if (isNaN(mediaFileId)) {
      return NextResponse.json(
        { error: 'Invalid media file ID' },
        { status: 400 }
      );
    }

    const mediaUsageService = MediaUsageService.getInstance();
    const usages = await mediaUsageService.getFileUsage(mediaFileId);
    const deletionCheck = await mediaUsageService.canDeleteFile(mediaFileId);

    return NextResponse.json({
      success: true,
      data: {
        usages,
        can_delete: deletionCheck.canDelete,
        usage_count: deletionCheck.usageCount,
      },
    });

  } catch (error) {
    console.error('Error fetching media usage:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage';
    
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

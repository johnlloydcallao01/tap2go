import { NextRequest, NextResponse } from 'next/server';
import { MediaUsageService } from '@/lib/services/mediaUsageService';

/**
 * Media Usage Tracking API
 * POST /api/media/usage - Track media file usage
 * DELETE /api/media/usage - Remove usage tracking
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { media_file_id, entity_type, entity_id, usage_type, context } = body;

    // Validate required fields
    if (!media_file_id || !entity_type || !entity_id || !usage_type) {
      return NextResponse.json(
        { error: 'media_file_id, entity_type, entity_id, and usage_type are required' },
        { status: 400 }
      );
    }

    const mediaUsageService = MediaUsageService.getInstance();
    const usage = await mediaUsageService.trackUsage(media_file_id, {
      entity_type,
      entity_id,
      usage_type,
      context,
    });

    return NextResponse.json({
      success: true,
      message: 'Media usage tracked successfully',
      data: usage,
    });

  } catch (error) {
    console.error('Media usage tracking error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to track usage';
    
    return NextResponse.json(
      { 
        error: 'Usage tracking failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaFileId = searchParams.get('media_file_id');
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!mediaFileId || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'media_file_id, entity_type, and entity_id are required' },
        { status: 400 }
      );
    }

    const mediaUsageService = MediaUsageService.getInstance();
    const success = await mediaUsageService.removeUsage(
      parseInt(mediaFileId),
      entityType,
      entityId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove usage tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Media usage removed successfully',
    });

  } catch (error) {
    console.error('Media usage removal error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove usage';
    
    return NextResponse.json(
      { 
        error: 'Usage removal failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

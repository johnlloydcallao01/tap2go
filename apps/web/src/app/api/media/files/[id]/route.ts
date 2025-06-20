import { NextRequest, NextResponse } from 'next/server';
import { MediaLibraryService } from '@/lib/services/mediaLibraryService';

/**
 * Individual Media File API Endpoints
 * GET /api/media/files/[id] - Get single media file
 * PUT /api/media/files/[id] - Update media file metadata
 * DELETE /api/media/files/[id] - Delete media file
 */

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid media file ID' },
        { status: 400 }
      );
    }

    const mediaLibraryService = MediaLibraryService.getInstance();
    const mediaFile = await mediaLibraryService.getMediaFileById(id);

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mediaFile,
    });

  } catch (error) {
    console.error('Error fetching media file:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch media file';
    
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid media file ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alt_text, caption, description, title, visibility } = body;

    // Validate visibility if provided
    if (visibility && !['public', 'private', 'restricted'].includes(visibility)) {
      return NextResponse.json(
        { error: 'Invalid visibility value' },
        { status: 400 }
      );
    }

    const updates = {
      ...(alt_text !== undefined && { alt_text }),
      ...(caption !== undefined && { caption }),
      ...(description !== undefined && { description }),
      ...(title !== undefined && { title }),
      ...(visibility !== undefined && { visibility }),
    };

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const mediaLibraryService = MediaLibraryService.getInstance();
    const updatedMediaFile = await mediaLibraryService.updateMediaFile(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Media file updated successfully',
      data: updatedMediaFile,
    });

  } catch (error) {
    console.error('Error updating media file:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update media file';
    
    return NextResponse.json(
      { 
        error: 'Update failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid media file ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const hardDelete = searchParams.get('hard_delete') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required for deletion' },
        { status: 400 }
      );
    }

    const mediaLibraryService = MediaLibraryService.getInstance();

    let success: boolean;
    let message: string;

    if (hardDelete) {
      // Perform hard delete (permanent removal from database and Cloudinary)
      success = await mediaLibraryService.hardDeleteMediaFile(id, userId);
      message = 'Media file permanently deleted successfully';
    } else {
      // Perform soft delete (mark as deleted)
      success = await mediaLibraryService.deleteMediaFile(id, userId);
      message = 'Media file deleted successfully';
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete media file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      hard_delete: hardDelete,
    });

  } catch (error) {
    console.error('Error deleting media file:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to delete media file';

    return NextResponse.json(
      {
        error: 'Delete failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

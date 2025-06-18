import { NextRequest, NextResponse } from 'next/server';
import { MediaLibraryService } from '@/lib/services/mediaLibraryService';

/**
 * Media Folders API Endpoint
 * GET /api/media/folders - Get all folders
 * POST /api/media/folders - Create new folder
 */

export async function GET() {
  try {
    const mediaLibraryService = MediaLibraryService.getInstance();
    const folders = await mediaLibraryService.getFolders();

    return NextResponse.json({
      success: true,
      data: folders,
    });

  } catch (error) {
    console.error('Error fetching folders:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch folders';
    
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parent_id, description, created_by } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (parent_id && (typeof parent_id !== 'number' || parent_id < 1)) {
      return NextResponse.json(
        { error: 'Invalid parent_id' },
        { status: 400 }
      );
    }

    const mediaLibraryService = MediaLibraryService.getInstance();
    const folder = await mediaLibraryService.createFolder(
      name.trim(),
      parent_id || undefined,
      description || undefined,
      created_by || 'system'
    );

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      data: folder,
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create folder';
    
    return NextResponse.json(
      { 
        error: 'Creation failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

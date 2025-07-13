import { NextRequest, NextResponse } from 'next/server';
import { MediaLibraryService } from '@/lib/services/mediaLibraryService';
import type { MediaSearchFilters, MediaSearchOptions } from '@/lib/services/mediaLibraryService';

/**
 * Media Files API Endpoint
 * GET /api/media/files
 * 
 * Retrieves media files with filtering, searching, and pagination
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search filters
    const filters: MediaSearchFilters = {
      query: searchParams.get('query') || undefined,
      folder_id: searchParams.get('folder_id') ? parseInt(searchParams.get('folder_id')!) : undefined,
      file_type: searchParams.get('file_type') || undefined,
      mime_type: searchParams.get('mime_type') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      status: (searchParams.get('status') as 'active' | 'archived' | 'deleted') || undefined,
      visibility: (searchParams.get('visibility') as 'public' | 'private' | 'restricted') || undefined,
      uploaded_by: searchParams.get('uploaded_by') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      min_size: searchParams.get('min_size') ? parseInt(searchParams.get('min_size')!) : undefined,
      max_size: searchParams.get('max_size') ? parseInt(searchParams.get('max_size')!) : undefined,
      is_used: searchParams.get('is_used') ? searchParams.get('is_used') === 'true' : undefined,
    };

    // Parse search options
    const options: MediaSearchOptions = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sort_by: (searchParams.get('sort_by') as 'created_at' | 'filename' | 'file_size') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    // Validate pagination
    if (options.page! < 1) options.page = 1;
    if (options.limit! < 1 || options.limit! > 100) options.limit = 20;

    const mediaLibraryService = MediaLibraryService.getInstance();
    const result = await mediaLibraryService.getMediaFiles(filters, options);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: Math.ceil(result.total / result.limit),
      },
    });

  } catch (error) {
    console.error('Error fetching media files:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch media files';
    
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

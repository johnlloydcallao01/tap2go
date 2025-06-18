import { NextRequest, NextResponse } from 'next/server';
import { MediaLibraryService } from '@/lib/services/mediaLibraryService';

// Configure the API route to handle file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Media Upload API Endpoint
 * POST /api/media/upload
 * 
 * Handles file uploads for the admin media library
 * Uploads to Cloudinary and saves metadata to Supabase
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface UploadRequestBody {
  folder?: string;
  tags?: string[];
  alt_text?: string;
  caption?: string;
  description?: string;
  title?: string;
  visibility?: 'public' | 'private' | 'restricted';
  uploaded_by: string;
}

function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload request received');
    console.log('Content-Type:', request.headers.get('content-type'));

    const formData = await request.formData();
    console.log('📋 FormData parsed successfully');

    const file = formData.get('file') as File;
    console.log('📁 File from FormData:', file ? `${file.name} (${file.size} bytes)` : 'No file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Parse additional metadata
    const uploadOptions: UploadRequestBody = {
      folder: formData.get('folder')?.toString(),
      tags: formData.get('tags')?.toString().split(',').filter(Boolean),
      alt_text: formData.get('alt_text')?.toString(),
      caption: formData.get('caption')?.toString(),
      description: formData.get('description')?.toString(),
      title: formData.get('title')?.toString(),
      visibility: (formData.get('visibility')?.toString() as 'public' | 'private' | 'restricted') || 'public',
      uploaded_by: formData.get('uploaded_by')?.toString() || 'anonymous',
    };

    // Validate required fields
    if (!uploadOptions.uploaded_by || uploadOptions.uploaded_by === 'anonymous') {
      return NextResponse.json(
        { error: 'uploaded_by is required' },
        { status: 400 }
      );
    }

    // Upload file using MediaLibraryService
    const mediaLibraryService = MediaLibraryService.getInstance();
    const mediaFile = await mediaLibraryService.uploadFile(file, uploadOptions);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: mediaFile,
    });

  } catch (error) {
    console.error('Media upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

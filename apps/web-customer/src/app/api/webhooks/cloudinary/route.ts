import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import crypto from 'crypto';

/**
 * Cloudinary Webhook Handler
 * POST /api/webhooks/cloudinary
 * 
 * Handles upload notifications from Cloudinary and syncs metadata to Supabase
 * 
 * Webhook Events:
 * - upload: File uploaded successfully
 * - delete: File deleted from Cloudinary
 * - update: File metadata updated
 */

interface CloudinaryWebhookPayload {
  notification_type: 'upload' | 'delete' | 'update';
  timestamp: number;
  request_id: string;
  public_id: string;
  version: number;
  width?: number;
  height?: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw';
  created_at: string;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
  api_key: string;
  tags?: string[];
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Verify Cloudinary webhook signature
 */
function verifyCloudinarySignature(
  body: string,
  timestamp: string,
  signature: string
): boolean {
  const webhookSecret = process.env.CLOUDINARY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('CLOUDINARY_WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow in development
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body + timestamp)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying Cloudinary signature:', error);
    return false;
  }
}

/**
 * Extract folder information from public_id
 */
function extractFolderInfo(publicId: string): { folderPath: string; filename: string } {
  const parts = publicId.split('/');
  if (parts.length === 1) {
    return { folderPath: '/', filename: parts[0] };
  }
  
  const filename = parts.pop() || '';
  const folderPath = '/' + parts.join('/');
  
  return { folderPath, filename };
}

/**
 * Get or create folder in Supabase
 */
async function getOrCreateFolder(folderPath: string): Promise<number | null> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }

  if (folderPath === '/' || !folderPath) {
    return null; // Root folder
  }

  // Check if folder exists
  const { data: existingFolder } = await supabaseAdmin
    .from('media_folders')
    .select('id')
    .eq('path', folderPath)
    .single();

  if (existingFolder) {
    return existingFolder.id;
  }

  // Create folder
  const folderName = folderPath.split('/').pop() || 'Untitled';
  const slug = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const { data: newFolder, error } = await supabaseAdmin
    .from('media_folders')
    .insert({
      name: folderName,
      slug: `${slug}-${Date.now()}`, // Ensure uniqueness
      path: folderPath,
      description: `Auto-created folder from Cloudinary upload`,
      is_system: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    return null;
  }

  return newFolder?.id || null;
}

/**
 * Handle upload notification
 */
async function handleUploadNotification(payload: CloudinaryWebhookPayload) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }

  const { folderPath, filename } = extractFolderInfo(payload.public_id);
  const folderId = await getOrCreateFolder(folderPath);

  // Determine file type and MIME type
  const fileType = payload.resource_type === 'video' ? 'video' : 
                  payload.resource_type === 'raw' ? 'document' : 'image';
  
  const mimeType = payload.resource_type === 'image' ? `image/${payload.format}` :
                  payload.resource_type === 'video' ? `video/${payload.format}` :
                  `application/${payload.format}`;

  // Calculate aspect ratio for images/videos
  let aspectRatio = null;
  if (payload.width && payload.height) {
    aspectRatio = (payload.width / payload.height).toFixed(4);
  }

  // Prepare media file data
  const mediaFileData = {
    filename: `${filename}.${payload.format}`,
    original_filename: payload.original_filename || `${filename}.${payload.format}`,
    file_path: payload.public_id,
    file_url: payload.secure_url,
    thumbnail_url: payload.resource_type === 'image' 
      ? payload.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/')
      : null,
    file_type: fileType,
    mime_type: mimeType,
    file_size: payload.bytes,
    file_extension: payload.format,
    width: payload.width || null,
    height: payload.height || null,
    aspect_ratio: aspectRatio,
    folder_id: folderId,
    folder_path: folderPath,
    cloudinary_public_id: payload.public_id,
    cloudinary_version: payload.version.toString(),
    storage_provider: 'cloudinary',
    uploaded_by: 'system', // Will be updated when we have user context
    upload_source: 'cloudinary_webhook',
    status: 'active',
    visibility: 'public',
  };

  // Insert or update media file
  const { data, error } = await supabaseAdmin
    .from('media_files')
    .upsert(mediaFileData, {
      onConflict: 'cloudinary_public_id',
      ignoreDuplicates: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving media file to database:', error);
    throw error;
  }

  console.log(`Media file saved to database:`, {
    id: data?.id,
    publicId: payload.public_id,
    filename: mediaFileData.filename,
  });

  return data;
}

/**
 * Handle delete notification
 */
async function handleDeleteNotification(payload: CloudinaryWebhookPayload) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }

  // Soft delete the media file
  const { error } = await supabaseAdmin
    .from('media_files')
    .update({
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      deleted_by: 'system',
    })
    .eq('cloudinary_public_id', payload.public_id);

  if (error) {
    console.error('Error soft deleting media file:', error);
    throw error;
  }

  console.log(`Media file soft deleted:`, {
    publicId: payload.public_id,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body and headers
    const body = await request.text();
    const timestamp = request.headers.get('x-cld-timestamp') || '';
    const signature = request.headers.get('x-cld-signature') || '';

    console.log('Cloudinary webhook received:', {
      timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
    });

    // Verify signature
    if (!verifyCloudinarySignature(body, timestamp, signature)) {
      console.error('Invalid Cloudinary webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload: CloudinaryWebhookPayload = JSON.parse(body);
    
    console.log(`Processing Cloudinary webhook: ${payload.notification_type}`, {
      publicId: payload.public_id,
      resourceType: payload.resource_type,
      bytes: payload.bytes,
    });

    // Handle different notification types
    switch (payload.notification_type) {
      case 'upload':
        await handleUploadNotification(payload);
        break;
        
      case 'delete':
        await handleDeleteNotification(payload);
        break;
        
      case 'update':
        // For now, treat updates as uploads (re-sync metadata)
        await handleUploadNotification(payload);
        break;
        
      default:
        console.log(`Unhandled Cloudinary notification type: ${payload.notification_type}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
      publicId: payload.public_id,
      notificationType: payload.notification_type,
    });

  } catch (error) {
    console.error('Cloudinary webhook error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

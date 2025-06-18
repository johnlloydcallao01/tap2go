/**
 * Media Library Service
 * Professional service layer for media management operations
 * Integrates Cloudinary storage with Supabase metadata management
 */

import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import type { CloudinaryUploadResult } from '@/lib/cloudinary';

// Types
export interface MediaFile {
  id: number;
  uuid: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  file_extension: string;
  width?: number;
  height?: number;
  duration?: number;
  aspect_ratio?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  title?: string;
  folder_id?: number;
  folder_path?: string;
  is_used: boolean;
  usage_count: number;
  last_used_at?: string;
  status: 'active' | 'archived' | 'deleted';
  visibility: 'public' | 'private' | 'restricted';
  uploaded_by: string;
  upload_source: string;
  cloudinary_public_id?: string;
  cloudinary_version?: string;
  storage_provider: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  folder_name?: string;
  full_folder_path?: string;
}

export interface MediaFolder {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  path: string;
  is_system: boolean;
  file_count: number;
  total_size: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadOptions {
  folder?: string;
  tags?: string[];
  alt_text?: string;
  caption?: string;
  description?: string;
  title?: string;
  visibility?: 'public' | 'private' | 'restricted';
  uploaded_by: string;
}

export interface MediaSearchFilters {
  query?: string;
  folder_id?: number;
  file_type?: string;
  mime_type?: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'deleted';
  visibility?: 'public' | 'private' | 'restricted';
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
  min_size?: number;
  max_size?: number;
  is_used?: boolean;
}

export interface MediaSearchOptions {
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'filename' | 'file_size' | 'usage_count';
  sort_order?: 'asc' | 'desc';
}

export class MediaLibraryService {
  private static instance: MediaLibraryService;
  
  public static getInstance(): MediaLibraryService {
    if (!MediaLibraryService.instance) {
      MediaLibraryService.instance = new MediaLibraryService();
    }
    return MediaLibraryService.instance;
  }

  /**
   * Upload file to Cloudinary and save metadata to Supabase
   */
  async uploadFile(
    file: File,
    options: MediaUploadOptions
  ): Promise<MediaFile> {
    try {
      // Upload to Cloudinary using the tap2go-uploads preset
      const cloudinaryResult = await uploadToCloudinary(file, {
        upload_preset: 'tap2go-uploads',
        folder: options.folder || 'main-uploads',
        resource_type: 'auto' as const,
        tags: options.tags,
      });

      console.log('📋 Cloudinary result:', {
        public_id: cloudinaryResult.public_id,
        secure_url: cloudinaryResult.secure_url,
        url: cloudinaryResult.url,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      });

      // Prepare metadata for Supabase
      const mediaFileData = await this.prepareMediaFileData(
        file,
        cloudinaryResult,
        options
      );

      // Save to Supabase
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('media_files')
        .insert(mediaFileData)
        .select('*')
        .single();

      if (error) {
        console.error('Error saving media file to database:', error);
        // Try to cleanup Cloudinary upload
        if (cloudinaryResult.public_id) {
          await deleteFromCloudinary(cloudinaryResult.public_id);
        }
        throw new Error(`Failed to save media file: ${error.message}`);
      }

      return this.transformMediaFileData(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get media files with filtering and pagination
   */
  async getMediaFiles(
    filters: MediaSearchFilters = {},
    options: MediaSearchOptions = {}
  ): Promise<{ data: MediaFile[]; total: number; page: number; limit: number }> {
    try {
      const client = supabaseAdmin || supabase;
      let query = client
        .from('media_files')
        .select(`
          *,
          folder_name:media_folders(name)
        `, { count: 'exact' })
        .eq('status', 'active')
        .is('deleted_at', null);

      // Apply filters
      if (filters.query) {
        query = query.textSearch('search_vector', filters.query);
      }

      if (filters.folder_id !== undefined) {
        if (filters.folder_id === null) {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', filters.folder_id);
        }
      }

      if (filters.file_type) {
        query = query.ilike('file_type', `${filters.file_type}%`);
      }

      if (filters.mime_type) {
        query = query.eq('mime_type', filters.mime_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters.uploaded_by) {
        query = query.eq('uploaded_by', filters.uploaded_by);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.min_size) {
        query = query.gte('file_size', filters.min_size);
      }

      if (filters.max_size) {
        query = query.lte('file_size', filters.max_size);
      }

      if (filters.is_used !== undefined) {
        query = query.eq('is_used', filters.is_used);
      }

      // Apply sorting
      const sortBy = options.sort_by || 'created_at';
      const sortOrder = options.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching media files:', error);
        throw new Error(`Failed to fetch media files: ${error.message}`);
      }

      return {
        data: (data || []).map(this.transformMediaFileData),
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getMediaFiles:', error);
      throw error;
    }
  }

  /**
   * Get media file by ID
   */
  async getMediaFileById(id: number): Promise<MediaFile | null> {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('media_files')
        .select(`
          *,
          folder_name:media_folders(name)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch media file: ${error.message}`);
      }

      return this.transformMediaFileData(data);
    } catch (error) {
      console.error('Error fetching media file by ID:', error);
      throw error;
    }
  }

  /**
   * Update media file metadata
   */
  async updateMediaFile(
    id: number,
    updates: Partial<Pick<MediaFile, 'alt_text' | 'caption' | 'description' | 'title' | 'visibility'>>
  ): Promise<MediaFile> {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('media_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update media file: ${error.message}`);
      }

      return this.transformMediaFileData(data);
    } catch (error) {
      console.error('Error updating media file:', error);
      throw error;
    }
  }

  /**
   * Soft delete media file - now also deletes from Cloudinary
   */
  async deleteMediaFile(id: number, userId: string): Promise<boolean> {
    try {
      const client = supabaseAdmin || supabase;

      // Check if file is in use
      const { data: usageData } = await client
        .from('media_usage')
        .select('id, entity_type, entity_id, usage_type')
        .eq('media_file_id', id);

      if (usageData && usageData.length > 0) {
        const usageDetails = usageData.map(u => `${u.entity_type}:${u.entity_id} (${u.usage_type})`).join(', ');
        throw new Error(`Cannot delete media file that is currently in use by: ${usageDetails}`);
      }

      // Get file info for cleanup
      const { data: fileData } = await client
        .from('media_files')
        .select('cloudinary_public_id, filename')
        .eq('id', id)
        .single();

      // Delete from Cloudinary first (before soft delete)
      if (fileData?.cloudinary_public_id) {
        try {
          console.log('🌩️ Deleting from Cloudinary during soft delete:', fileData.cloudinary_public_id);
          const cloudinaryDeleted = await deleteFromCloudinary(fileData.cloudinary_public_id);

          if (!cloudinaryDeleted) {
            console.warn('⚠️ Failed to delete from Cloudinary, but continuing with soft delete');
          } else {
            console.log('✅ Successfully deleted from Cloudinary during soft delete');
          }
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary deletion error during soft delete:', cloudinaryError);
          // Continue with soft delete even if Cloudinary fails
        }
      }

      // Soft delete in database
      const { error } = await client
        .from('media_files')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete media file: ${error.message}`);
      }

      console.log('✅ Successfully soft deleted media file:', {
        id,
        filename: fileData?.filename,
        cloudinary_deleted: !!fileData?.cloudinary_public_id
      });

      return true;
    } catch (error) {
      console.error('Error deleting media file:', error);
      throw error;
    }
  }

  /**
   * Hard delete media file - permanently removes from database and Cloudinary
   * @param id - Media file ID to delete
   * @param userId - User ID for audit trail (currently not used but kept for API compatibility)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async hardDeleteMediaFile(id: number, userId?: string): Promise<boolean> {
    try {
      const client = supabaseAdmin || supabase;

      // Get file info before deletion
      const { data: fileData, error: fetchError } = await client
        .from('media_files')
        .select('cloudinary_public_id, filename, file_url')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch media file: ${fetchError.message}`);
      }

      if (!fileData) {
        throw new Error('Media file not found');
      }

      console.log('🗑️ Starting hard delete for file:', {
        id,
        filename: fileData.filename,
        cloudinary_public_id: fileData.cloudinary_public_id
      });

      // Step 1: Delete from Cloudinary first
      if (fileData.cloudinary_public_id) {
        try {
          console.log('🌩️ Deleting from Cloudinary:', fileData.cloudinary_public_id);
          const cloudinaryDeleted = await deleteFromCloudinary(fileData.cloudinary_public_id);

          if (!cloudinaryDeleted) {
            console.warn('⚠️ Failed to delete from Cloudinary, but continuing with database deletion');
          } else {
            console.log('✅ Successfully deleted from Cloudinary');
          }
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary deletion error:', cloudinaryError);
          // Continue with database deletion even if Cloudinary fails
        }
      }

      // Step 2: Delete related records from database (in correct order due to foreign keys)

      // Delete usage tracking
      const { error: usageError } = await client
        .from('media_usage')
        .delete()
        .eq('media_file_id', id);

      if (usageError) {
        console.warn('⚠️ Error deleting media usage records:', usageError);
      }

      // Delete tag associations
      const { error: tagsError } = await client
        .from('media_file_tags')
        .delete()
        .eq('media_file_id', id);

      if (tagsError) {
        console.warn('⚠️ Error deleting media file tags:', tagsError);
      }

      // Delete collection associations
      const { error: collectionsError } = await client
        .from('media_collection_items')
        .delete()
        .eq('media_file_id', id);

      if (collectionsError) {
        console.warn('⚠️ Error deleting media collection items:', collectionsError);
      }

      // Delete processing jobs
      const { error: jobsError } = await client
        .from('media_processing_jobs')
        .delete()
        .eq('media_file_id', id);

      if (jobsError) {
        console.warn('⚠️ Error deleting media processing jobs:', jobsError);
      }

      // Step 3: Finally delete the main media file record
      const { error: deleteError } = await client
        .from('media_files')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Failed to delete media file from database: ${deleteError.message}`);
      }

      console.log('✅ Successfully hard deleted media file:', {
        id,
        filename: fileData.filename
      });

      return true;
    } catch (error) {
      console.error('❌ Error hard deleting media file:', error);
      throw error;
    }
  }

  /**
   * Get all folders
   */
  async getFolders(): Promise<MediaFolder[]> {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('media_folders')
        .select('*')
        .order('path');

      if (error) {
        throw new Error(`Failed to fetch folders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  /**
   * Create new folder
   */
  async createFolder(
    name: string,
    parentId?: number,
    description?: string,
    createdBy?: string
  ): Promise<MediaFolder> {
    try {
      const client = supabaseAdmin || supabase;
      
      // Generate slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Generate path
      let path = `/${slug}`;
      if (parentId) {
        const { data: parentFolder } = await client
          .from('media_folders')
          .select('path')
          .eq('id', parentId)
          .single();
        
        if (parentFolder) {
          path = `${parentFolder.path}/${slug}`;
        }
      }

      const { data, error } = await client
        .from('media_folders')
        .insert({
          name,
          slug: `${slug}-${Date.now()}`, // Ensure uniqueness
          description,
          parent_id: parentId,
          path,
          is_system: false,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create folder: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Prepare media file data for database insertion
   */
  private async prepareMediaFileData(
    file: File,
    cloudinaryResult: CloudinaryUploadResult,
    options: MediaUploadOptions
  ): Promise<Record<string, unknown>> {
    // Get folder ID if folder specified
    let folderId = null;
    if (options.folder) {
      const client = supabaseAdmin || supabase;
      const { data: folderData } = await client
        .from('media_folders')
        .select('id')
        .eq('path', `/${options.folder}`)
        .single();
      
      folderId = folderData?.id || null;
    }

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' : 'document';

    // Calculate aspect ratio for images/videos
    let aspectRatio = null;
    if (cloudinaryResult.width && cloudinaryResult.height) {
      aspectRatio = (cloudinaryResult.width / cloudinaryResult.height).toFixed(4);
    }

    return {
      filename: file.name,
      original_filename: file.name,
      file_path: cloudinaryResult.public_id,
      file_url: cloudinaryResult.secure_url,
      thumbnail_url: fileType === 'image' 
        ? cloudinaryResult.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/')
        : null,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      file_extension: file.name.split('.').pop()?.toLowerCase() || '',
      width: cloudinaryResult.width || null,
      height: cloudinaryResult.height || null,
      aspect_ratio: aspectRatio,
      alt_text: options.alt_text,
      caption: options.caption,
      description: options.description,
      title: options.title,
      folder_id: folderId,
      folder_path: options.folder ? `/${options.folder}` : '/',
      cloudinary_public_id: cloudinaryResult.public_id,
      cloudinary_version: cloudinaryResult.version?.toString(),
      storage_provider: 'cloudinary',
      uploaded_by: options.uploaded_by,
      upload_source: 'admin_panel',
      status: 'active',
      visibility: options.visibility || 'public',
    };
  }

  /**
   * Transform database row to MediaFile interface
   */
  private transformMediaFileData(data: Record<string, unknown>): MediaFile {
    return {
      ...data,
      tags: (data.tags as string[]) || [],
      folder_name: (data.folder_name as { name: string } | null)?.name || null,
    } as MediaFile;
  }
}

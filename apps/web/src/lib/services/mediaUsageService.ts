/**
 * Media Usage Tracking Service
 * Tracks where media files are used across the application
 */

import { supabase, supabaseAdmin } from '@/lib/supabase/client';

export interface MediaUsage {
  id: number;
  media_file_id: number;
  entity_type: string; // 'blog_post', 'menu_item', 'restaurant', 'promotion', etc.
  entity_id: string;
  usage_type: string; // 'featured_image', 'gallery', 'thumbnail', 'background', etc.
  usage_context: Record<string, unknown>;
  created_at: string;
}

export interface UsageTrackingOptions {
  entity_type: string;
  entity_id: string;
  usage_type: string;
  context?: Record<string, unknown>;
}

export class MediaUsageService {
  private static instance: MediaUsageService;
  
  public static getInstance(): MediaUsageService {
    if (!MediaUsageService.instance) {
      MediaUsageService.instance = new MediaUsageService();
    }
    return MediaUsageService.instance;
  }

  /**
   * Track media file usage
   */
  async trackUsage(
    mediaFileId: number,
    options: UsageTrackingOptions
  ): Promise<MediaUsage> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('media_usage')
        .insert({
          media_file_id: mediaFileId,
          entity_type: options.entity_type,
          entity_id: options.entity_id,
          usage_type: options.usage_type,
          usage_context: options.context || {},
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to track media usage: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error tracking media usage:', error);
      throw error;
    }
  }

  /**
   * Remove usage tracking
   */
  async removeUsage(
    mediaFileId: number,
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { error } = await client
        .from('media_usage')
        .delete()
        .eq('media_file_id', mediaFileId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        throw new Error(`Failed to remove media usage: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing media usage:', error);
      throw error;
    }
  }

  /**
   * Get usage for a specific media file
   */
  async getFileUsage(mediaFileId: number): Promise<MediaUsage[]> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('media_usage')
        .select('*')
        .eq('media_file_id', mediaFileId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get file usage: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting file usage:', error);
      throw error;
    }
  }

  /**
   * Get all media files used by an entity
   */
  async getEntityMedia(
    entityType: string,
    entityId: string
  ): Promise<Array<MediaUsage & { media_file: Record<string, unknown> }>> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('media_usage')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get entity media: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting entity media:', error);
      throw error;
    }
  }

  /**
   * Check if a media file can be safely deleted
   */
  async canDeleteFile(mediaFileId: number): Promise<{
    canDelete: boolean;
    usageCount: number;
    usages: MediaUsage[];
  }> {
    try {
      const usages = await this.getFileUsage(mediaFileId);
      
      return {
        canDelete: usages.length === 0,
        usageCount: usages.length,
        usages,
      };
    } catch (error) {
      console.error('Error checking file deletion safety:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics for the media library
   */
  async getUsageStats(): Promise<{
    totalFiles: number;
    usedFiles: number;
    unusedFiles: number;
    totalUsages: number;
    usagesByType: Array<{ entity_type: string; count: number }>;
  }> {
    try {
      const client = supabaseAdmin || supabase;
      
      // Get total files count
      const { count: totalFiles } = await client
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get used files count
      const { count: usedFiles } = await client
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('is_used', true);

      // Get total usages count
      const { count: totalUsages } = await client
        .from('media_usage')
        .select('*', { count: 'exact', head: true });

      // Get usages by entity type
      const { data: usagesByType } = await client
        .from('media_usage')
        .select('entity_type')
        .then(({ data }) => {
          if (!data) return { data: [] };
          
          const counts = data.reduce((acc, usage) => {
            acc[usage.entity_type] = (acc[usage.entity_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            data: Object.entries(counts).map(([entity_type, count]) => ({
              entity_type,
              count,
            })),
          };
        });

      return {
        totalFiles: totalFiles || 0,
        usedFiles: usedFiles || 0,
        unusedFiles: (totalFiles || 0) - (usedFiles || 0),
        totalUsages: totalUsages || 0,
        usagesByType: usagesByType || [],
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  /**
   * Bulk update usage tracking for an entity
   * Useful when updating content that references multiple media files
   */
  async updateEntityMedia(
    entityType: string,
    entityId: string,
    mediaFiles: Array<{
      mediaFileId: number;
      usageType: string;
      context?: Record<string, unknown>;
    }>
  ): Promise<void> {
    try {
      const client = supabaseAdmin || supabase;
      
      // Remove existing usages for this entity
      await client
        .from('media_usage')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      // Add new usages
      if (mediaFiles.length > 0) {
        const usages = mediaFiles.map(file => ({
          media_file_id: file.mediaFileId,
          entity_type: entityType,
          entity_id: entityId,
          usage_type: file.usageType,
          usage_context: file.context || {},
        }));

        const { error } = await client
          .from('media_usage')
          .insert(usages);

        if (error) {
          throw new Error(`Failed to update entity media: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error updating entity media:', error);
      throw error;
    }
  }

  /**
   * Find unused media files
   */
  async findUnusedFiles(olderThanDays?: number): Promise<Array<{
    id: number;
    filename: string;
    file_size: number;
    created_at: string;
    file_url: string;
  }>> {
    try {
      const client = supabaseAdmin || supabase;
      
      let query = client
        .from('media_files')
        .select('id, filename, file_size, created_at, file_url')
        .eq('status', 'active')
        .eq('is_used', false);

      if (olderThanDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        query = query.lt('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to find unused files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error finding unused files:', error);
      throw error;
    }
  }
}

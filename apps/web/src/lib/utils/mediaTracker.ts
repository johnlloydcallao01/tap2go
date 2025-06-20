/**
 * Media Usage Tracking Utilities
 * Helper functions for tracking media usage across the application
 */

import { MediaUsageService } from '@/lib/services/mediaUsageService';

export interface MediaReference {
  mediaFileId: number;
  usageType: string;
  context?: Record<string, unknown>;
}

/**
 * Track media usage for client-side components
 */
export async function trackMediaUsage(
  mediaFileId: number,
  entityType: string,
  entityId: string,
  usageType: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch('/api/media/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_file_id: mediaFileId,
        entity_type: entityType,
        entity_id: entityId,
        usage_type: usageType,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track media usage');
    }

    return true;
  } catch (error) {
    console.error('Error tracking media usage:', error);
    return false;
  }
}

/**
 * Remove media usage tracking for client-side components
 */
export async function removeMediaUsage(
  mediaFileId: number,
  entityType: string,
  entityId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/media/usage?media_file_id=${mediaFileId}&entity_type=${entityType}&entity_id=${entityId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove media usage');
    }

    return true;
  } catch (error) {
    console.error('Error removing media usage:', error);
    return false;
  }
}

/**
 * Get media usage for a file (client-side)
 */
export async function getMediaUsage(mediaFileId: number) {
  try {
    const response = await fetch(`/api/media/usage/${mediaFileId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch media usage');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching media usage:', error);
    return null;
  }
}

/**
 * Server-side utility for tracking media usage in API routes
 */
export class ServerMediaTracker {
  private mediaUsageService: MediaUsageService;

  constructor() {
    this.mediaUsageService = MediaUsageService.getInstance();
  }

  /**
   * Track media usage when creating/updating content
   */
  async trackContentMedia(
    entityType: string,
    entityId: string,
    mediaReferences: MediaReference[]
  ): Promise<void> {
    try {
      await this.mediaUsageService.updateEntityMedia(
        entityType,
        entityId,
        mediaReferences.map(ref => ({
          mediaFileId: ref.mediaFileId,
          usageType: ref.usageType,
          context: ref.context,
        }))
      );
    } catch (error) {
      console.error('Error tracking content media:', error);
      throw error;
    }
  }

  /**
   * Remove all media tracking for an entity (when deleting content)
   */
  async removeContentMedia(entityType: string, entityId: string): Promise<void> {
    try {
      await this.mediaUsageService.updateEntityMedia(entityType, entityId, []);
    } catch (error) {
      console.error('Error removing content media:', error);
      throw error;
    }
  }

  /**
   * Extract media file IDs from content (e.g., from HTML or markdown)
   */
  extractMediaFromContent(content: string): number[] {
    const mediaIds: number[] = [];
    
    // Extract from Cloudinary URLs
    const cloudinaryRegex = /https?:\/\/res\.cloudinary\.com\/[^\/]+\/[^\/]+\/upload\/[^\/]+\/([^\/\s"']+)/g;
    let match;
    
    while ((match = cloudinaryRegex.exec(content)) !== null) {
      // This is a simplified extraction - you might need more sophisticated logic
      // to map Cloudinary public IDs back to database IDs
      // For now, we'll assume the public ID contains the database ID
      const publicId = match[1];
      const idMatch = publicId.match(/(\d+)/);
      if (idMatch) {
        mediaIds.push(parseInt(idMatch[1]));
      }
    }

    // Extract from direct media file references
    const mediaRefRegex = /data-media-id="(\d+)"/g;
    while ((match = mediaRefRegex.exec(content)) !== null) {
      mediaIds.push(parseInt(match[1]));
    }

    return [...new Set(mediaIds)]; // Remove duplicates
  }

  /**
   * Track media usage from content automatically
   */
  async trackMediaFromContent(
    content: string,
    entityType: string,
    entityId: string,
    defaultUsageType: string = 'content'
  ): Promise<void> {
    const mediaIds = this.extractMediaFromContent(content);
    
    if (mediaIds.length > 0) {
      const mediaReferences: MediaReference[] = mediaIds.map(id => ({
        mediaFileId: id,
        usageType: defaultUsageType,
        context: { extracted_from_content: true },
      }));

      await this.trackContentMedia(entityType, entityId, mediaReferences);
    }
  }
}

/**
 * React hook for media usage tracking
 */
export function useMediaTracker() {
  const trackUsage = async (
    mediaFileId: number,
    entityType: string,
    entityId: string,
    usageType: string,
    context?: Record<string, unknown>
  ) => {
    return trackMediaUsage(mediaFileId, entityType, entityId, usageType, context);
  };

  const removeUsage = async (
    mediaFileId: number,
    entityType: string,
    entityId: string
  ) => {
    return removeMediaUsage(mediaFileId, entityType, entityId);
  };

  const getUsage = async (mediaFileId: number) => {
    return getMediaUsage(mediaFileId);
  };

  return {
    trackUsage,
    removeUsage,
    getUsage,
  };
}

/**
 * Common entity types for consistency
 */
export const ENTITY_TYPES = {
  BLOG_POST: 'blog_post',
  MENU_ITEM: 'menu_item',
  RESTAURANT: 'restaurant',
  PROMOTION: 'promotion',
  BANNER: 'banner',
  USER_PROFILE: 'user_profile',
  CATEGORY: 'category',
  PAGE: 'page',
} as const;

/**
 * Common usage types for consistency
 */
export const USAGE_TYPES = {
  FEATURED_IMAGE: 'featured_image',
  GALLERY: 'gallery',
  THUMBNAIL: 'thumbnail',
  BACKGROUND: 'background',
  LOGO: 'logo',
  ICON: 'icon',
  CONTENT: 'content',
  ATTACHMENT: 'attachment',
} as const;

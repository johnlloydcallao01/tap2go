/**
 * Media API Library - PayloadCMS Integration
 * Connects to PayloadCMS server for media management
 */

import { MediaFile, MediaListResponse, MediaUploadResponse } from './types';

// Get CMS URL from environment or use default
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.grandlinemaritime.com';
const API_BASE_URL = `${CMS_BASE_URL}/api`;

/**
 * PayloadCMS API client for media management
 */
class MediaAPIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload file to media library
   */
  async uploadFile(file: File, metadata?: {
    alt?: string;
    caption?: string;
  }): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata?.alt) {
      formData.append('alt', metadata.alt);
    }
    if (metadata?.caption) {
      formData.append('caption', metadata.caption);
    }

    const response = await fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.doc;
  }

  /**
   * Get all media files with optional filtering
   */
  async getMediaFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    mimeType?: string;
  }): Promise<MediaListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('where[filename][contains]', params.search);
    if (params?.mimeType) searchParams.append('where[mimeType][equals]', params.mimeType);

    return this.request<MediaListResponse>(`/media?${searchParams.toString()}`);
  }

  /**
   * Get single media file by ID
   */
  async getMediaFile(id: number): Promise<MediaFile> {
    return this.request<MediaFile>(`/media/${id}`);
  }

  /**
   * Update media file metadata
   */
  async updateMediaFile(
    id: number, 
    updates: {
      alt?: string;
      caption?: string;
    }
  ): Promise<MediaFile> {
    const result = await this.request<{ doc: MediaFile }>(`/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    return result.doc;
  }

  /**
   * Delete media file
   */
  async deleteMediaFile(id: number): Promise<void> {
    await this.request(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete multiple media files
   */
  async deleteMultipleMediaFiles(ids: number[]): Promise<{ success: number[], failed: { id: number, error: string }[] }> {
    const results = await Promise.allSettled(
      ids.map(id => this.deleteMediaFile(id).then(() => id))
    );

    const success: number[] = [];
    const failed: { id: number, error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        failed.push({
          id: ids[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { success, failed };
  }

  /**
   * Get media statistics
   */
  async getMediaStats(): Promise<{
    totalFiles: number;
    totalImages: number;
    totalVideos: number;
    totalDocuments: number;
    totalSize: number;
  }> {
    const response = await this.getMediaFiles({ limit: 1000 }); // Get all files for stats
    const files = response.docs;

    return {
      totalFiles: files.length,
      totalImages: files.filter(f => f.mimeType?.startsWith('image/')).length,
      totalVideos: files.filter(f => f.mimeType?.startsWith('video/')).length,
      totalDocuments: files.filter(f => !f.mimeType?.startsWith('image/') && !f.mimeType?.startsWith('video/')).length,
      totalSize: files.reduce((sum, f) => sum + (f.filesize || 0), 0)
    };
  }
}

// Export singleton instance
export const mediaAPI = new MediaAPIClient();
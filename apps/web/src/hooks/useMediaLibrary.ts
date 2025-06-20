/**
 * Media Library Hook
 * Custom React hook for media library operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { MediaFile, MediaFolder, MediaSearchFilters, MediaSearchOptions } from '@/lib/services/mediaLibraryService';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MediaLibraryState {
  files: MediaFile[];
  folders: MediaFolder[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  result?: MediaFile;
}

export function useMediaLibrary() {
  const [state, setState] = useState<MediaLibraryState>({
    files: [],
    folders: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
    },
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch media files with filters and pagination
   */
  const fetchFiles = useCallback(async (
    filters: MediaSearchFilters = {},
    options: MediaSearchOptions = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchParams = new URLSearchParams();
      
      // Add filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','));
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });

      // Add options to search params
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/media/files?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch media files');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        files: data.data,
        pagination: data.pagination,
        loading: false,
      }));

    } catch (error) {
      console.error('Error fetching media files:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch media files',
        loading: false,
      }));
    }
  }, []);

  /**
   * Fetch folders
   */
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/media/folders');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch folders');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        folders: data.data,
      }));

    } catch (error) {
      console.error('Error fetching folders:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch folders',
      }));
    }
  }, []);

  /**
   * Upload files
   */
  const uploadFiles = useCallback(async (
    files: File[],
    options: {
      folder?: string;
      tags?: string[];
      alt_text?: string;
      caption?: string;
      description?: string;
      title?: string;
      visibility?: 'public' | 'private' | 'restricted';
      uploaded_by: string;
    }
  ) => {
    const uploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadProgress(uploads);

    const results = await Promise.allSettled(
      files.map(async (file, index) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          // Add metadata
          Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                formData.append(key, value.join(','));
              } else {
                formData.append(key, value.toString());
              }
            }
          });

          const response = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
          }

          const data = await response.json();
          
          // Update upload progress
          setUploadProgress(prev => prev.map((upload, i) => 
            i === index 
              ? { ...upload, progress: 100, status: 'success', result: data.data }
              : upload
          ));

          return data.data;

        } catch (error) {
          console.error('Upload error:', error);
          
          // Update upload progress with error
          setUploadProgress(prev => prev.map((upload, i) => 
            i === index 
              ? { 
                  ...upload, 
                  progress: 0, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : upload
          ));

          throw error;
        }
      })
    );

    // Extract successful uploads and add them to the file list
    const successfulUploads = results
      .filter((result): result is PromiseFulfilledResult<MediaFile> =>
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    if (successfulUploads.length > 0) {
      // Add new files to the beginning of the current file list
      setState(prev => ({
        ...prev,
        files: [...successfulUploads, ...prev.files],
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + successfulUploads.length,
        },
      }));
    }

    // Clear upload progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);

    return results;
  }, []);

  /**
   * Delete media file (soft delete by default)
   */
  const deleteFile = useCallback(async (id: number, userId: string, hardDelete: boolean = false) => {
    try {
      const url = new URL(`/api/media/files/${id}`, window.location.origin);
      url.searchParams.set('user_id', userId);
      if (hardDelete) {
        url.searchParams.set('hard_delete', 'true');
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      const result = await response.json();
      console.log(`✅ File ${hardDelete ? 'permanently' : 'soft'} deleted:`, result);

      // Remove from local state
      setState(prev => ({
        ...prev,
        files: prev.files.filter(file => file.id !== id),
      }));

      return true;

    } catch (error) {
      console.error('Delete error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Delete failed',
      }));
      return false;
    }
  }, []);

  /**
   * Update media file metadata
   */
  const updateFile = useCallback(async (
    id: number,
    updates: {
      alt_text?: string;
      caption?: string;
      description?: string;
      title?: string;
      visibility?: 'public' | 'private' | 'restricted';
    }
  ) => {
    try {
      const response = await fetch(`/api/media/files/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const data = await response.json();

      // Update local state
      setState(prev => ({
        ...prev,
        files: prev.files.map(file => 
          file.id === id ? data.data : file
        ),
      }));

      return data.data;

    } catch (error) {
      console.error('Update error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Update failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Create folder
   */
  const createFolder = useCallback(async (
    name: string,
    parentId?: number,
    description?: string,
    createdBy?: string
  ) => {
    try {
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          parent_id: parentId,
          description,
          created_by: createdBy || 'system',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create folder');
      }

      const data = await response.json();

      // Add to local state
      setState(prev => ({
        ...prev,
        folders: [...prev.folders, data.data],
      }));

      return data.data;

    } catch (error) {
      console.error('Create folder error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create folder',
      }));
      throw error;
    }
  }, []);

  /**
   * Process Cloudinary cleanup queue
   */
  const processCleanupQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/media/cleanup-cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize: 5, // Process 5 items at a time
          retryFailed: true,
          maxRetries: 3
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🧹 Cloudinary cleanup processed:', data.data);
      }
    } catch (error) {
      console.error('Error processing cleanup queue:', error);
    }
  }, []);

  /**
   * Setup real-time subscriptions
   */
  const setupRealtimeSubscription = useCallback(() => {
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new subscription for media_files table
    const channel = supabase
      .channel('media_files_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'media_files'
        },
        (payload) => {
          console.log('📡 Real-time media_files change:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              // Add new file to the list
              if (payload.new) {
                setState(prev => ({
                  ...prev,
                  files: [payload.new as MediaFile, ...prev.files],
                  pagination: {
                    ...prev.pagination,
                    total: prev.pagination.total + 1,
                  },
                }));
              }
              break;

            case 'UPDATE':
              // Update existing file
              if (payload.new) {
                setState(prev => ({
                  ...prev,
                  files: prev.files.map(file =>
                    file.id === payload.new.id ? payload.new as MediaFile : file
                  ),
                }));
              }
              break;

            case 'DELETE':
              // Remove deleted file
              if (payload.old) {
                setState(prev => ({
                  ...prev,
                  files: prev.files.filter(file => file.id !== payload.old.id),
                  pagination: {
                    ...prev.pagination,
                    total: Math.max(0, prev.pagination.total - 1),
                  },
                }));
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    channelRef.current = channel;
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load initial data and setup real-time subscriptions
  useEffect(() => {
    fetchFiles();
    fetchFolders();
    setupRealtimeSubscription();

    // Set up periodic cleanup queue processing (every 30 seconds)
    cleanupIntervalRef.current = setInterval(() => {
      processCleanupQueue();
    }, 30000);

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [fetchFiles, fetchFolders, setupRealtimeSubscription, processCleanupQueue]);

  return {
    // State
    files: state.files,
    folders: state.folders,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    uploadProgress,

    // Actions
    fetchFiles,
    fetchFolders,
    uploadFiles,
    deleteFile,
    updateFile,
    createFolder,
    clearError,
    processCleanupQueue,
  };
}

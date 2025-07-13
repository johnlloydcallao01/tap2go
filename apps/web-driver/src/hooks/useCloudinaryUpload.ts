import { useState, useCallback } from 'react';

// Cloudinary upload result interface
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  version: number;
  created_at: string;
}

// Upload state interface
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: CloudinaryUploadResult | null;
}

// Upload options
export interface UseCloudinaryUploadOptions {
  onSuccess?: (result: CloudinaryUploadResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

// Custom hook for Cloudinary uploads
export const useCloudinaryUpload = (options: UseCloudinaryUploadOptions = {}) => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  const uploadFile = useCallback(async (
    file: File,
    uploadType: 'restaurant' | 'menu-item' | 'avatar' | 'document' | 'video',
    additionalData?: Record<string, string>
  ) => {
    try {
      setState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Call our API endpoint
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: CloudinaryUploadResult = await response.json();

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        result,
      }));

      options.onSuccess?.(result);
      options.onProgress?.(100);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
      }));

      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  const uploadRestaurantImage = useCallback((file: File, restaurantId: string) => {
    return uploadFile(file, 'restaurant', { restaurantId });
  }, [uploadFile]);

  const uploadMenuItemImage = useCallback((file: File, restaurantId: string, menuItemId?: string) => {
    return uploadFile(file, 'menu-item', { 
      restaurantId, 
      ...(menuItemId && { menuItemId }) 
    });
  }, [uploadFile]);

  const uploadUserAvatar = useCallback((file: File, userId: string) => {
    return uploadFile(file, 'avatar', { userId });
  }, [uploadFile]);

  const uploadDocument = useCallback((file: File, userId: string, documentType: string) => {
    return uploadFile(file, 'document', { userId, documentType });
  }, [uploadFile]);

  const uploadVideo = useCallback((file: File, restaurantId: string, videoType: string = 'promotional') => {
    return uploadFile(file, 'video', { restaurantId, videoType });
  }, [uploadFile]);

  return {
    // State
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
    result: state.result,
    
    // Actions
    uploadFile,
    uploadRestaurantImage,
    uploadMenuItemImage,
    uploadUserAvatar,
    uploadDocument,
    uploadVideo,
    resetState,
  };
};

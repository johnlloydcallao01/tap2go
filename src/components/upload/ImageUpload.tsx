'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { getOptimizedImageUrl, isCloudinaryUrl } from '@/lib/cloudinary/transform';

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string, publicId?: string) => void;
  uploadType: 'restaurant' | 'menu-item' | 'avatar';
  additionalData?: Record<string, string>;
  className?: string;
  placeholder?: string;
  maxSize?: number; // in MB
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  uploadType,
  additionalData = {},
  className = '',
  placeholder = 'Click to upload or drag and drop',
  maxSize = 10,
  aspectRatio = 'landscape',
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isUploading,
    progress,
    error,
    uploadFile,
    resetState,
  } = useCloudinaryUpload({
    onSuccess: (result) => {
      setPreview(result.secure_url);
      onChange(result.secure_url, result.public_id);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      await uploadFile(file, uploadType, additionalData);
    } catch {
      // Reset preview on error
      setPreview(value || null);
      URL.revokeObjectURL(previewUrl);
    }
  }, [uploadFile, uploadType, additionalData, maxSize, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    multiple: false,
    disabled: disabled || isUploading,
  });

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
      default:
        return 'aspect-[4/3]';
    }
  };

  const getOptimizedPreview = (url: string) => {
    if (isCloudinaryUrl(url)) {
      return getOptimizedImageUrl(url, {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      });
    }
    return url;
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
          ${getAspectRatioClass()}
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {preview ? (
          <div className="relative w-full h-full group">
            <Image
              src={getOptimizedPreview(preview)}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger file input
                    fileInputRef.current?.click();
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  disabled={disabled || isUploading}
                >
                  <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  disabled={disabled || isUploading}
                >
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm font-medium">{progress}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-medium text-gray-600">Uploading... {progress}%</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-red-600 mb-2">Upload failed</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            ) : (
              <div className="text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-600 mb-2">{placeholder}</p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to {maxSize}MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

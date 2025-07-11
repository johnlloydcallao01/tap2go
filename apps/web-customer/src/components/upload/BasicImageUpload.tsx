'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface BasicImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  uploadType: 'restaurant' | 'menu-item' | 'avatar';
  additionalData?: Record<string, string>;
  placeholder?: string;
  disabled?: boolean;
}

export default function BasicImageUpload({
  value,
  onChange,
  uploadType,
  additionalData: _additionalData = {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  placeholder = 'Click to upload image',
  disabled = false,
}: BasicImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Simulate upload for now - just use the preview URL
      // In a real implementation, you would upload to your preferred service
      setTimeout(() => {
        // For testing, we'll just use the preview URL as the "uploaded" URL
        const mockCloudinaryUrl = `https://res.cloudinary.com/dpekh75yi/image/upload/v${Date.now()}/${uploadType}s/${uploadType}_${Date.now()}.jpg`;
        const mockPublicId = `${uploadType}s/${uploadType}_${Date.now()}`;
        
        onChange(mockCloudinaryUrl, mockPublicId);
        setIsUploading(false);
        
        console.log('Mock upload successful:', {
          url: mockCloudinaryUrl,
          publicId: mockPublicId
        });
      }, 2000); // Simulate 2 second upload

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setPreview(value || null);
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (disabled || isUploading) return;
    
    setPreview(null);
    setError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 aspect-[4/3]
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <Image
              src={preview}
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
                    handleClick();
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
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-medium text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-600 mb-2">{placeholder}</p>
                <p className="text-xs text-gray-500">
                  Click to browse or drag & drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Demo notice */}
      <p className="mt-2 text-xs text-blue-600">
        📝 Demo mode: File picker works, simulating upload to Cloudinary
      </p>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Cloudinary Upload Widget types
declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryUploadWidgetProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  uploadType: 'restaurant' | 'menu-item' | 'avatar';
  additionalData?: Record<string, string>;
  placeholder?: string;
  disabled?: boolean;
}

export default function CloudinaryUploadWidget({
  value,
  onChange,
  uploadType,
  additionalData = {},
  placeholder = 'Click to upload image',
  disabled = false,
}: CloudinaryUploadWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const widgetRef = useRef<any>(null);

  // Load Cloudinary Upload Widget script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Initialize upload widget
  useEffect(() => {
    if (typeof window !== 'undefined' && window.cloudinary && !widgetRef.current) {
      // Get folder based on upload type
      const folder = uploadType === 'restaurant' ? 'restaurants' :
                    uploadType === 'menu-item' ? 'menu-items' : 'avatars';

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: 'ml_default', // Use unsigned preset
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          maxImageWidth: 2000,
          maxImageHeight: 2000,
          folder: folder,
          publicId: `${uploadType}_${Date.now()}`,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          cropping: false,
          showAdvancedOptions: false,
          showSkipCropButton: true,
          croppingAspectRatio: uploadType === 'avatar' ? 1 : 4/3,
          theme: 'minimal',
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#f3a823',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#f3a823',
              action: '#f3a823',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            }
          }
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Upload error:', error);
            setError('Upload failed. Please try again.');
            setIsLoading(false);
            return;
          }

          if (result.event === 'success') {
            console.log('Upload successful:', result.info);
            setPreview(result.info.secure_url);
            setError(null);
            setIsLoading(false);
            onChange(result.info.secure_url, result.info.public_id);
          }

          if (result.event === 'upload-added') {
            setIsLoading(true);
            setError(null);
          }
        }
      );
    }
  }, [uploadType, onChange]);

  const handleClick = () => {
    if (disabled || isLoading || !widgetRef.current) return;
    
    setError(null);
    widgetRef.current.open();
  };

  const handleRemove = () => {
    if (disabled || isLoading) return;
    
    setPreview(null);
    setError(null);
    onChange('');
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 aspect-[4/3]
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
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
                  disabled={disabled || isLoading}
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
                  disabled={disabled || isLoading}
                >
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>

            {/* Upload progress */}
            {isLoading && (
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
            {isLoading ? (
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

      {/* Loading Cloudinary Widget */}
      {typeof window !== 'undefined' && !window.cloudinary && (
        <p className="mt-2 text-xs text-gray-500">Loading upload widget...</p>
      )}
    </div>
  );
}

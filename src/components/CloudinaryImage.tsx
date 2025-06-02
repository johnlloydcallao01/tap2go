'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  getOptimizedImageUrl,
  isCloudinaryUrl,
  extractPublicId,
  generateSrcSet
} from '@/lib/cloudinary/transform';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: 'auto' | number;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb';
  gravity?: 'face' | 'center' | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  priority = false,
  quality = 'auto',
  crop = 'fill',
  gravity,
  format = 'auto',
  fallbackSrc,
  onError,
  onLoad,
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image error
  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Get optimized image URL
  const getImageSrc = () => {
    if (imageError && fallbackSrc) {
      return fallbackSrc;
    }

    if (!src) {
      return fallbackSrc || '';
    }

    // If it's a Cloudinary URL, optimize it
    if (isCloudinaryUrl(src)) {
      const publicId = extractPublicId(src);
      if (publicId) {
        return getOptimizedImageUrl(publicId, {
          width,
          height,
          crop,
          gravity,
          quality,
          format,
        });
      }
    }

    // Return original URL if not Cloudinary
    return src;
  };

  // Generate srcSet for responsive images
  const getSrcSet = () => {
    if (!isCloudinaryUrl(src) || !width) {
      return undefined;
    }

    const publicId = extractPublicId(src);
    if (!publicId) {
      return undefined;
    }

    return generateSrcSet(publicId, width);
  };

  const imageSrc = getImageSrc();
  const srcSet = getSrcSet();

  // Fallback content when no image
  if (!imageSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-500">
              {alt ? alt.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate max-w-[100px]">
            {alt || 'No image'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={fill ? undefined : { width, height }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        sizes={sizes}
        priority={priority}
        quality={typeof quality === 'number' ? quality : 75}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          objectFit: crop === 'fit' ? 'contain' : 'cover',
        }}
      />

      {/* Error state */}
      {imageError && !fallbackSrc && (
        <div 
          className="absolute inset-0 bg-gray-200 flex items-center justify-center"
          style={fill ? undefined : { width, height }}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-500">!</span>
            </div>
            <p className="text-xs text-gray-500">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
}

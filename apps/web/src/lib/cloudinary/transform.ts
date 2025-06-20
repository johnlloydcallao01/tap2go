import { cloudinaryConfig, TRANSFORMATIONS } from './config';

// Simple URL generation without complex SDK
const buildCloudinaryUrl = (
  publicId: string,
  transformations: string[] = []
): string => {
  if (!publicId || !cloudinaryConfig.cloudName) {
    return '';
  }

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}`;
  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

  return `${baseUrl}/image/upload/${transformString}${publicId}`;
};

// Transformation options interface
export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb';
  gravity?: 'face' | 'center' | 'auto';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  dpr?: 'auto' | number;
}

// Generate optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: TransformationOptions = {}
): string => {
  if (!publicId || !cloudinaryConfig.cloudName) {
    return '';
  }

  try {
    const transformations: string[] = [];

    // Add dimensions
    if (options.width || options.height) {
      const crop = options.crop || 'fill';
      let transform = `c_${crop}`;

      if (options.width) transform += `,w_${options.width}`;
      if (options.height) transform += `,h_${options.height}`;

      transformations.push(transform);
    }

    // Add gravity
    if (options.gravity) {
      let gravityTransform = '';
      switch (options.gravity) {
        case 'face':
          gravityTransform = 'g_face';
          break;
        case 'center':
          gravityTransform = 'g_center';
          break;
        case 'auto':
          gravityTransform = 'g_auto';
          break;
      }
      if (gravityTransform) {
        transformations.push(gravityTransform);
      }
    }

    // Add quality
    const quality = options.quality === 'auto' ? 'q_auto' :
                   typeof options.quality === 'number' ? `q_${options.quality}` :
                   'q_auto';
    transformations.push(quality);

    // Add format
    const format = options.format === 'auto' ? 'f_auto' :
                  options.format ? `f_${options.format}` :
                  'f_auto';
    transformations.push(format);

    // Add DPR if specified
    if (options.dpr === 'auto') {
      transformations.push('dpr_auto');
    } else if (typeof options.dpr === 'number') {
      transformations.push(`dpr_${options.dpr}`);
    }

    return buildCloudinaryUrl(publicId, transformations);
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return '';
  }
};

// Predefined transformation functions
export const getRestaurantCardImage = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.RESTAURANT_CARD);
};

export const getRestaurantHeroImage = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.RESTAURANT_HERO);
};

export const getMenuItemImage = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.MENU_ITEM);
};

export const getMenuItemThumb = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.MENU_ITEM_THUMB);
};

export const getUserAvatar = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.AVATAR);
};

export const getUserAvatarSmall = (publicId: string): string => {
  return getOptimizedImageUrl(publicId, TRANSFORMATIONS.AVATAR_SMALL);
};

// Responsive image URLs for different screen sizes
export const getResponsiveImageUrls = (publicId: string) => {
  return {
    mobile: getOptimizedImageUrl(publicId, { width: 400, height: 300, crop: 'fill' }),
    tablet: getOptimizedImageUrl(publicId, { width: 600, height: 450, crop: 'fill' }),
    desktop: getOptimizedImageUrl(publicId, { width: 800, height: 600, crop: 'fill' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900, crop: 'fill' }),
  };
};

// Generate srcSet for responsive images
export const generateSrcSet = (publicId: string, baseWidth: number = 400): string => {
  const widths = [baseWidth, baseWidth * 1.5, baseWidth * 2, baseWidth * 3];
  
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, { 
        width: Math.round(width), 
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
        dpr: 'auto'
      });
      return `${url} ${width}w`;
    })
    .join(', ');
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl: string): string => {
  if (!cloudinaryUrl) return '';
  
  try {
    // Match pattern: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.ext
    const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

// Check if URL is a Cloudinary URL
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
};

// Generate video thumbnail
export const getVideoThumbnail = (publicId: string, options: TransformationOptions = {}): string => {
  if (!publicId || !cloudinaryConfig.cloudName) {
    return '';
  }

  try {
    const transformations: string[] = [];

    // Convert to image
    transformations.push('f_jpg');

    // Add dimensions
    if (options.width || options.height) {
      const crop = options.crop || 'fill';
      let transform = `c_${crop}`;

      if (options.width) transform += `,w_${options.width}`;
      if (options.height) transform += `,h_${options.height}`;

      transformations.push(transform);
    }

    transformations.push('q_auto');

    const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}`;
    const transformString = transformations.join(',') + '/';

    return `${baseUrl}/video/upload/${transformString}${publicId}`;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return '';
  }
};

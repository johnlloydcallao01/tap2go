/**
 * Enhanced Cloudinary Integration for CMS Content
 * Building on existing Cloudinary setup with CMS-specific optimizations
 */

import { getOptimizedImageUrl } from './index';

// Enhanced folder structure for CMS content
export const CMS_FOLDERS = {
  // Blog content
  BLOG_POSTS: 'blog-posts',
  BLOG_FEATURED: 'blog-posts/featured',
  BLOG_THUMBNAILS: 'blog-posts/thumbnails',
  
  // Restaurant content galleries
  RESTAURANT_GALLERIES: 'restaurant-galleries',
  RESTAURANT_HEROES: 'restaurant-heroes',
  RESTAURANT_AWARDS: 'restaurant-awards',
  RESTAURANT_CERTIFICATIONS: 'restaurant-certifications',
  
  // Menu content
  MENU_CATEGORIES: 'menu-categories',
  MENU_ITEMS_DETAILED: 'menu-items/detailed',
  MENU_INGREDIENTS: 'menu-items/ingredients',
  
  // Promotional content
  PROMOTIONS: 'promotions',
  PROMOTION_BANNERS: 'promotions/banners',
  HOMEPAGE_BANNERS: 'homepage/banners',
  
  // SEO and marketing
  SEO_IMAGES: 'seo-images',
  SOCIAL_MEDIA: 'social-media',
  
  // Static pages
  STATIC_PAGES: 'static-pages',
  HELP_CONTENT: 'help-content',
};

// Upload presets for different content types
export const CMS_UPLOAD_PRESETS = {
  BLOG_POST_UPLOAD: 'blog_post_upload',
  RESTAURANT_GALLERY_UPLOAD: 'restaurant_gallery_upload',
  MENU_CONTENT_UPLOAD: 'menu_content_upload',
  PROMOTION_UPLOAD: 'promotion_upload',
  SEO_IMAGE_UPLOAD: 'seo_image_upload',
  STATIC_PAGE_UPLOAD: 'static_page_upload',
};

/**
 * CMS-specific image optimization configurations
 */
export const CMS_IMAGE_CONFIGS = {
  // Blog post images
  blog: {
    hero: { width: 1200, height: 630, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    featured: { width: 800, height: 450, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    thumbnail: { width: 400, height: 250, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    inline: { width: 800, height: 450, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },
    social: { width: 1200, height: 630, crop: 'fill' as const, quality: 'auto' as const, format: 'jpg' as const }
  },

  // Restaurant content images
  restaurant: {
    hero: { width: 1920, height: 1080, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    card: { width: 400, height: 300, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    gallery: { width: 800, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    galleryThumb: { width: 200, height: 150, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    award: { width: 300, height: 300, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },
    certification: { width: 400, height: 300, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const }
  },

  // Menu content images
  menu: {
    category: { width: 600, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    categoryThumb: { width: 200, height: 150, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    item: { width: 600, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    itemThumb: { width: 150, height: 150, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    itemDetail: { width: 800, height: 600, crop: 'fit' as const, quality: 'auto' as const, format: 'webp' as const },
    ingredient: { width: 100, height: 100, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const }
  },

  // Promotional content images
  promotion: {
    banner: { width: 1200, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    card: { width: 300, height: 200, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    hero: { width: 1920, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    mobile: { width: 800, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const }
  },

  // Homepage banners
  homepage: {
    banner: { width: 1920, height: 800, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    bannerMobile: { width: 800, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const },
    feature: { width: 600, height: 400, crop: 'fill' as const, quality: 'auto' as const, format: 'webp' as const }
  },

  // SEO and social media
  seo: {
    ogImage: { width: 1200, height: 630, crop: 'fill' as const, quality: 'auto' as const, format: 'jpg' as const },
    twitterCard: { width: 1200, height: 600, crop: 'fill' as const, quality: 'auto' as const, format: 'jpg' as const },
    favicon: { width: 32, height: 32, crop: 'fill' as const, quality: 'auto' as const, format: 'png' as const }
  }
};

/**
 * CMS Image Optimizer Class
 * Provides optimized image URLs for different CMS content types
 */
class CMSImageOptimizer {
  /**
   * Get optimized blog post images
   */
  static getBlogPostImages(publicId: string) {
    return {
      hero: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.blog.hero),
      featured: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.blog.featured),
      thumbnail: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.blog.thumbnail),
      inline: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.blog.inline),
      social: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.blog.social)
    };
  }

  /**
   * Get optimized restaurant images
   */
  static getRestaurantImages(publicId: string) {
    return {
      hero: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.hero),
      card: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.card),
      gallery: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.gallery),
      galleryThumb: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.galleryThumb),
      award: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.award),
      certification: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.restaurant.certification)
    };
  }

  /**
   * Get optimized menu images
   */
  static getMenuImages(publicId: string) {
    return {
      category: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.category),
      categoryThumb: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.categoryThumb),
      item: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.item),
      itemThumb: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.itemThumb),
      itemDetail: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.itemDetail),
      ingredient: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.menu.ingredient)
    };
  }

  /**
   * Get optimized promotion images
   */
  static getPromotionImages(publicId: string) {
    return {
      banner: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.promotion.banner),
      card: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.promotion.card),
      hero: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.promotion.hero),
      mobile: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.promotion.mobile)
    };
  }

  /**
   * Get optimized homepage banner images
   */
  static getHomepageBannerImages(publicId: string) {
    return {
      banner: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.homepage.banner),
      bannerMobile: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.homepage.bannerMobile),
      feature: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.homepage.feature)
    };
  }

  /**
   * Get SEO optimized images
   */
  static getSEOImages(publicId: string) {
    return {
      ogImage: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.seo.ogImage),
      twitterCard: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.seo.twitterCard),
      favicon: getOptimizedImageUrl(publicId, CMS_IMAGE_CONFIGS.seo.favicon)
    };
  }

  /**
   * Generate responsive image set for any content type
   */
  static generateResponsiveImageSet(publicId: string, baseConfig: Record<string, unknown>) {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    const aspectRatio = (baseConfig.height as number) ? (baseConfig.height as number) / (baseConfig.width as number) : 0.6;

    const srcSet = breakpoints.map(width => {
      const height = Math.round(width * aspectRatio);
      const url = getOptimizedImageUrl(publicId, {
        ...baseConfig,
        width,
        height,
        crop: 'fill'
      });
      return `${url} ${width}w`;
    }).join(', ');

    return {
      srcSet,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      src: getOptimizedImageUrl(publicId, baseConfig)
    };
  }

  /**
   * Get optimized image for specific context and size
   */
  static getOptimizedImage(
    publicId: string,
    context: keyof typeof CMS_IMAGE_CONFIGS,
    size: string,
    customOptions?: Record<string, unknown>
  ): string {
    const config = CMS_IMAGE_CONFIGS[context];
    if (!config || !(size in config)) {
      console.warn(`Invalid context or size: ${context}.${size}`);
      return getOptimizedImageUrl(publicId, { width: 400, height: 300, crop: 'fill' as const });
    }

    const sizeConfig = (config as Record<string, unknown>)[size] as Record<string, unknown>;
    const options = customOptions && typeof sizeConfig === 'object' && sizeConfig !== null
      ? { ...sizeConfig, ...customOptions }
      : sizeConfig;
    return getOptimizedImageUrl(publicId, options);
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  static extractPublicId(cloudinaryUrl: string): string {
    try {
      const urlParts = cloudinaryUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        return cloudinaryUrl;
      }

      // Get everything after 'upload' and any transformations
      let publicIdParts = urlParts.slice(uploadIndex + 1);
      
      // Remove transformation parameters (they start with letters like 'w_', 'h_', etc.)
      publicIdParts = publicIdParts.filter(part => !part.includes('_') || part.includes('/'));
      
      // Join and remove file extension
      const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return cloudinaryUrl;
    }
  }

  /**
   * Get image metadata for CMS
   */
  static getImageMetadata(publicId: string) {
    return {
      publicId,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      baseUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formats: ['webp', 'jpg', 'png'],
      transformations: {
        auto: 'q_auto,f_auto',
        responsive: 'w_auto,c_scale',
        progressive: 'fl_progressive'
      }
    };
  }

  /**
   * Generate image alt text suggestions based on context
   */
  static generateAltText(context: string, itemName?: string, description?: string): string {
    const contextMap: Record<string, string> = {
      'blog': `Blog post image${itemName ? ` for ${itemName}` : ''}`,
      'restaurant': `${itemName || 'Restaurant'} photo`,
      'menu': `${itemName || 'Menu item'} image`,
      'promotion': `${itemName || 'Promotion'} banner`,
      'homepage': `${itemName || 'Homepage'} banner`,
      'seo': `${itemName || 'Page'} social media image`
    };

    let altText = contextMap[context] || 'Image';
    
    if (description) {
      altText += ` - ${description}`;
    }

    return altText;
  }
}

/**
 * CMS Upload Helper
 * Provides utilities for uploading images through CMS
 */
class CMSUploadHelper {
  /**
   * Get upload preset for content type
   */
  static getUploadPreset(contentType: string): string {
    const presetMap: Record<string, string> = {
      'blog': CMS_UPLOAD_PRESETS.BLOG_POST_UPLOAD,
      'restaurant': CMS_UPLOAD_PRESETS.RESTAURANT_GALLERY_UPLOAD,
      'menu': CMS_UPLOAD_PRESETS.MENU_CONTENT_UPLOAD,
      'promotion': CMS_UPLOAD_PRESETS.PROMOTION_UPLOAD,
      'seo': CMS_UPLOAD_PRESETS.SEO_IMAGE_UPLOAD,
      'static': CMS_UPLOAD_PRESETS.STATIC_PAGE_UPLOAD
    };

    return presetMap[contentType] || CMS_UPLOAD_PRESETS.BLOG_POST_UPLOAD;
  }

  /**
   * Get folder for content type
   */
  static getFolder(contentType: string, subType?: string): string {
    const folderMap: Record<string, string> = {
      'blog': subType === 'featured' ? CMS_FOLDERS.BLOG_FEATURED : CMS_FOLDERS.BLOG_POSTS,
      'restaurant': subType === 'hero' ? CMS_FOLDERS.RESTAURANT_HEROES : CMS_FOLDERS.RESTAURANT_GALLERIES,
      'menu': subType === 'category' ? CMS_FOLDERS.MENU_CATEGORIES : CMS_FOLDERS.MENU_ITEMS_DETAILED,
      'promotion': subType === 'banner' ? CMS_FOLDERS.PROMOTION_BANNERS : CMS_FOLDERS.PROMOTIONS,
      'homepage': CMS_FOLDERS.HOMEPAGE_BANNERS,
      'seo': CMS_FOLDERS.SEO_IMAGES,
      'static': CMS_FOLDERS.STATIC_PAGES
    };

    return folderMap[contentType] || CMS_FOLDERS.BLOG_POSTS;
  }

  /**
   * Generate upload parameters for Cloudinary widget
   */
  static getUploadParams(contentType: string, subType?: string) {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: this.getUploadPreset(contentType),
      folder: this.getFolder(contentType, subType),
      multiple: contentType === 'restaurant' && subType === 'gallery',
      maxFiles: contentType === 'restaurant' && subType === 'gallery' ? 10 : 1,
      maxFileSize: 10000000, // 10MB
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { quality: 'auto' },
        { format: 'auto' }
      ]
    };
  }
}

// Export the main optimizer class
export default CMSImageOptimizer;

// Export all utilities
export { CMSImageOptimizer, CMSUploadHelper };

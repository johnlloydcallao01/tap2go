// Export client-safe Cloudinary functionality
export * from './config';
export * from './transform';

// Export upload functions (these will only work on server-side)
export {
  uploadToCloudinary,
  uploadRestaurantImage,
  uploadMenuItemImage,
  uploadUserAvatar,
  uploadDocument,
  uploadVideo,
  deleteFromCloudinary,
  validateFile,
  type CloudinaryUploadResult,
  type UploadOptions,
} from './upload';

// Re-export transformation functions for convenience

export {
  getOptimizedImageUrl,
  getRestaurantCardImage,
  getRestaurantHeroImage,
  getMenuItemImage,
  getMenuItemThumb,
  getUserAvatar,
  getUserAvatarSmall,
  getResponsiveImageUrls,
  generateSrcSet,
  extractPublicId,
  isCloudinaryUrl,
  getVideoThumbnail,
} from './transform';

export {
  cloudinaryConfig,
  UPLOAD_PRESETS,
  FOLDERS,
  TRANSFORMATIONS,
  FILE_LIMITS,
  SUPPORTED_FORMATS,
} from './config';

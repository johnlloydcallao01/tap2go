// Validate environment variables
const requiredEnvVars = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
}

// Client-side configuration (safe to expose)
export const cloudinaryConfig = {
  cloudName: requiredEnvVars.cloudName,
  secure: true,
};

// Upload presets for different file types
export const UPLOAD_PRESETS = {
  RESTAURANTS: 'tap2go_restaurants',
  MENU_ITEMS: 'tap2go_menu_items', 
  AVATARS: 'tap2go_avatars',
  DOCUMENTS: 'tap2go_documents',
  VIDEOS: 'tap2go_videos',
} as const;

// Folder structure for organized uploads
export const FOLDERS = {
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menu-items',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  VIDEOS: 'videos',
  TEMP: 'temp',
} as const;

// Image transformation presets
export const TRANSFORMATIONS = {
  RESTAURANT_CARD: {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  RESTAURANT_HERO: {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  MENU_ITEM: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  MENU_ITEM_THUMB: {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  AVATAR: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  },
  AVATAR_SMALL: {
    width: 50,
    height: 50,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  },
} as const;

// File size limits (in bytes)
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  DOCUMENT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Supported file types
export const SUPPORTED_FORMATS = {
  IMAGES: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  VIDEOS: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
} as const;

// Note: Server-side cloudinary instance is imported separately in upload.ts

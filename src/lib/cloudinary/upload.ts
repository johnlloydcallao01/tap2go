import { FOLDERS, FILE_LIMITS, SUPPORTED_FORMATS } from './config';

// Upload result interface
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

// Upload options interface
export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  tags?: string[];
  context?: Record<string, string>;
  overwrite?: boolean;
}

// File validation
export const validateFile = (file: File, type: 'image' | 'video' | 'document'): string | null => {
  // Check file size
  const maxSize = type === 'video' ? FILE_LIMITS.VIDEO_MAX_SIZE :
                  type === 'document' ? FILE_LIMITS.DOCUMENT_MAX_SIZE :
                  FILE_LIMITS.IMAGE_MAX_SIZE;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `File size must be less than ${maxSizeMB}MB`;
  }

  // Check file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension) {
    return 'Invalid file format';
  }

  const supportedFormats = type === 'video' ? SUPPORTED_FORMATS.VIDEOS :
                          type === 'document' ? SUPPORTED_FORMATS.DOCUMENTS :
                          SUPPORTED_FORMATS.IMAGES;

  if (!(supportedFormats as readonly string[]).includes(fileExtension)) {
    return `Supported formats: ${supportedFormats.join(', ')}`;
  }

  return null;
};

// Convert File to base64 for upload
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Get Cloudinary instance (server-side only)
const getCloudinaryInstance = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary server SDK can only be used on the server side');
  }

  const { v2: cloudinary } = await import('cloudinary');

  // Configure if not already configured
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  return cloudinary;
};

// Upload file to Cloudinary (server-side)
export const uploadToCloudinary = async (
  file: File | string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const cloudinary = await getCloudinaryInstance();

    // Convert file to base64 if it's a File object
    const fileData = typeof file === 'string' ? file : await fileToBase64(file);

    const uploadOptions = {
      folder: options.folder || FOLDERS.TEMP,
      resource_type: options.resource_type || 'auto',
      quality: 'auto',
      format: 'auto',
      ...options,
    };

    const result = await cloudinary.uploader.upload(fileData, uploadOptions);

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Upload restaurant image
export const uploadRestaurantImage = async (
  file: File,
  restaurantId: string
): Promise<CloudinaryUploadResult> => {
  const validation = validateFile(file, 'image');
  if (validation) {
    throw new Error(validation);
  }

  return uploadToCloudinary(file, {
    folder: FOLDERS.RESTAURANTS,
    public_id: `restaurant_${restaurantId}_${Date.now()}`,
    tags: ['restaurant', 'food-delivery'],
    context: {
      restaurant_id: restaurantId,
      upload_type: 'restaurant_image'
    }
  });
};

// Upload menu item image
export const uploadMenuItemImage = async (
  file: File,
  restaurantId: string,
  menuItemId?: string
): Promise<CloudinaryUploadResult> => {
  const validation = validateFile(file, 'image');
  if (validation) {
    throw new Error(validation);
  }

  const publicId = menuItemId 
    ? `menu_${restaurantId}_${menuItemId}`
    : `menu_${restaurantId}_${Date.now()}`;

  return uploadToCloudinary(file, {
    folder: FOLDERS.MENU_ITEMS,
    public_id: publicId,
    tags: ['menu-item', 'food'],
    context: {
      restaurant_id: restaurantId,
      menu_item_id: menuItemId || '',
      upload_type: 'menu_item_image'
    }
  });
};

// Upload user avatar
export const uploadUserAvatar = async (
  file: File,
  userId: string
): Promise<CloudinaryUploadResult> => {
  const validation = validateFile(file, 'image');
  if (validation) {
    throw new Error(validation);
  }

  return uploadToCloudinary(file, {
    folder: FOLDERS.AVATARS,
    public_id: `avatar_${userId}`,
    tags: ['avatar', 'user'],
    context: {
      user_id: userId,
      upload_type: 'user_avatar'
    },
    overwrite: true // Allow overwriting existing avatar
  });
};

// Upload document
export const uploadDocument = async (
  file: File,
  userId: string,
  documentType: string
): Promise<CloudinaryUploadResult> => {
  const validation = validateFile(file, 'document');
  if (validation) {
    throw new Error(validation);
  }

  return uploadToCloudinary(file, {
    folder: FOLDERS.DOCUMENTS,
    public_id: `doc_${userId}_${documentType}_${Date.now()}`,
    resource_type: 'auto',
    tags: ['document', documentType],
    context: {
      user_id: userId,
      document_type: documentType,
      upload_type: 'document'
    }
  });
};

// Upload video
export const uploadVideo = async (
  file: File,
  restaurantId: string,
  videoType: string = 'promotional'
): Promise<CloudinaryUploadResult> => {
  const validation = validateFile(file, 'video');
  if (validation) {
    throw new Error(validation);
  }

  return uploadToCloudinary(file, {
    folder: FOLDERS.VIDEOS,
    public_id: `video_${restaurantId}_${videoType}_${Date.now()}`,
    resource_type: 'video',
    tags: ['video', videoType],
    context: {
      restaurant_id: restaurantId,
      video_type: videoType,
      upload_type: 'video'
    }
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const cloudinary = await getCloudinaryInstance();
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

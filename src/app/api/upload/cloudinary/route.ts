import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for server-side Cloudinary
const getCloudinaryInstance = async () => {
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

// File validation
const validateFile = (file: File, type: 'image' | 'video' | 'document'): string | null => {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 5 * 1024 * 1024, // 5MB
  };

  if (file.size > maxSizes[type]) {
    const maxSizeMB = Math.round(maxSizes[type] / (1024 * 1024));
    return `File size must be less than ${maxSizeMB}MB`;
  }

  const supportedFormats = {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    document: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  };

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !supportedFormats[type].includes(fileExtension)) {
    return `Supported formats: ${supportedFormats[type].join(', ')}`;
  }

  return null;
};

// Convert File to buffer for server-side upload
const fileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export async function POST(request: NextRequest) {
  try {
    const cloudinary = await getCloudinaryInstance();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadType) {
      return NextResponse.json(
        { error: 'Upload type is required' },
        { status: 400 }
      );
    }

    // Validate file based on type
    const fileType = uploadType === 'video' ? 'video' :
                    uploadType === 'document' ? 'document' : 'image';

    const validation = validateFile(file, fileType);
    if (validation) {
      return NextResponse.json(
        { error: validation },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = await fileToBuffer(file);

    // Prepare upload options based on type
    const uploadOptions: {
      resource_type: 'auto' | 'video';
      quality: string;
      format: string;
      folder?: string;
      public_id?: string;
      tags?: string[];
      overwrite?: boolean;
    } = {
      resource_type: fileType === 'video' ? 'video' : 'auto',
      quality: 'auto',
      format: 'auto',
    };

    // Set folder and public_id based on upload type
    switch (uploadType) {
      case 'restaurant': {
        const restaurantId = formData.get('restaurantId') as string;
        if (!restaurantId) {
          return NextResponse.json(
            { error: 'Restaurant ID is required' },
            { status: 400 }
          );
        }
        uploadOptions.folder = 'restaurants';
        uploadOptions.public_id = `restaurant_${restaurantId}_${Date.now()}`;
        uploadOptions.tags = ['restaurant', 'food-delivery'];
        break;
      }

      case 'menu-item': {
        const restaurantId = formData.get('restaurantId') as string;
        const menuItemId = formData.get('menuItemId') as string;

        if (!restaurantId) {
          return NextResponse.json(
            { error: 'Restaurant ID is required' },
            { status: 400 }
          );
        }

        uploadOptions.folder = 'menu-items';
        uploadOptions.public_id = menuItemId
          ? `menu_${restaurantId}_${menuItemId}`
          : `menu_${restaurantId}_${Date.now()}`;
        uploadOptions.tags = ['menu-item', 'food'];
        break;
      }

      case 'avatar': {
        const userId = formData.get('userId') as string;
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }
        uploadOptions.folder = 'avatars';
        uploadOptions.public_id = `avatar_${userId}`;
        uploadOptions.tags = ['avatar', 'user'];
        uploadOptions.overwrite = true;
        break;
      }

      case 'document': {
        const userId = formData.get('userId') as string;
        const documentType = formData.get('documentType') as string;

        if (!userId || !documentType) {
          return NextResponse.json(
            { error: 'User ID and document type are required' },
            { status: 400 }
          );
        }

        uploadOptions.folder = 'documents';
        uploadOptions.public_id = `doc_${userId}_${documentType}_${Date.now()}`;
        uploadOptions.tags = ['document', documentType];
        break;
      }

      case 'video': {
        const restaurantId = formData.get('restaurantId') as string;
        const videoType = formData.get('videoType') as string || 'promotional';

        if (!restaurantId) {
          return NextResponse.json(
            { error: 'Restaurant ID is required' },
            { status: 400 }
          );
        }

        uploadOptions.folder = 'videos';
        uploadOptions.public_id = `video_${restaurantId}_${videoType}_${Date.now()}`;
        uploadOptions.tags = ['video', videoType];
        uploadOptions.resource_type = 'video';
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    // Upload to Cloudinary using buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });

    const result = await uploadPromise;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

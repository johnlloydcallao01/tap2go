# Media Library Implementation

## Overview

The Media Library in the web-admin app is now fully integrated with the PayloadCMS server and Cloudinary for professional-grade media management. This implementation provides a complete solution for uploading, managing, and organizing media files with cloud storage.

## Architecture

```
Web Admin (Frontend) → PayloadCMS (Backend) → Cloudinary (Storage)
```

### Components

1. **Frontend (apps/web-admin)**
   - `src/app/cms/media/page.tsx` - Main media library page
   - `src/lib/api/media.ts` - API client for media operations
   - `src/components/media/MediaEditModal.tsx` - Edit media metadata
   - `src/components/media/ImageViewModal.tsx` - View images

2. **Backend (apps/cms)**
   - PayloadCMS with custom Cloudinary adapter
   - `src/collections/Media.ts` - Media collection configuration
   - `src/storage/cloudinary-adapter.ts` - Custom Cloudinary integration

3. **Storage (Cloudinary)**
   - Cloud storage for all media files
   - Automatic optimization and transformations
   - CDN delivery

## Features

### ✅ Implemented Features

- **File Upload**: Drag & drop or click to upload multiple files
- **File Management**: View, edit metadata, copy URLs, delete files
- **File Types**: Support for images, videos, and documents
- **Search & Filter**: Search by filename/alt text, filter by file type
- **Grid/List View**: Toggle between grid and list display modes
- **Real-time Updates**: Automatic refresh after operations
- **Error Handling**: Comprehensive error messages and loading states
- **Cloudinary Integration**: Automatic upload to Cloudinary with metadata
- **Responsive Design**: Works on desktop and mobile devices

### 🔄 API Operations

- `GET /api/media` - List all media files
- `POST /api/media` - Upload new media file
- `GET /api/media/:id` - Get single media file
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media file

## Configuration

### Environment Variables

Create `.env.local` in `apps/web-admin/`:

```env
# CMS Server
NEXT_PUBLIC_CMS_URL=http://localhost:3001

# Cloudinary (optional for direct uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### CMS Server Configuration

The CMS server is already configured with:
- PostgreSQL database
- Cloudinary storage adapter
- Media collection with proper fields

## Usage

### Starting the Servers

1. **Start CMS Server**:
   ```bash
   cd apps/cms
   npm run dev
   ```
   Server runs on http://localhost:3001

2. **Start Web Admin**:
   ```bash
   cd apps/web-admin
   npm run dev
   ```
   Admin panel runs on http://localhost:3000

### Using the Media Library

1. Navigate to `/cms/media` in the web admin
2. Upload files using the "Upload Files" button
3. View files in grid or list mode
4. Edit metadata by clicking the edit icon
5. Copy URLs or delete files as needed

## File Structure

```
apps/web-admin/src/
├── app/cms/media/
│   └── page.tsx                 # Main media library page
├── lib/api/
│   └── media.ts                 # API client
├── components/media/
│   ├── MediaEditModal.tsx       # Edit modal
│   └── ImageViewModal.tsx       # Image viewer
└── .env.example                 # Environment template

apps/cms/src/
├── collections/
│   └── Media.ts                 # PayloadCMS media collection
├── storage/
│   └── cloudinary-adapter.ts    # Cloudinary integration
└── payload.config.ts            # PayloadCMS configuration
```

## Technical Details

### Media File Interface

```typescript
interface MediaFile {
  id: number;
  alt: string;
  caption?: string;
  cloudinaryPublicId?: string;
  cloudinaryURL?: string;
  url?: string;
  thumbnailURL?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  focalX?: number;
  focalY?: number;
  updatedAt: string;
  createdAt: string;
}
```

### Upload Flow

1. User selects files in web admin
2. Files are sent to PayloadCMS `/api/media` endpoint
3. PayloadCMS processes files through Cloudinary adapter
4. Files are uploaded to Cloudinary with metadata
5. Database record is created with Cloudinary URLs
6. Frontend refreshes to show new files

### Error Handling

- Network errors are caught and displayed
- File validation (size, type) on both client and server
- Loading states during operations
- User-friendly error messages

## Testing

Run the test script to verify integration:

```bash
cd apps/web-admin
node test-media-api.js
```

## Troubleshooting

### Common Issues

1. **CMS Server Not Running**
   - Ensure `npm run dev` is running in `apps/cms`
   - Check database connection in CMS `.env`

2. **Upload Failures**
   - Verify Cloudinary credentials in CMS `.env`
   - Check file size limits
   - Ensure proper CORS configuration

3. **API Connection Issues**
   - Verify `NEXT_PUBLIC_CMS_URL` in web-admin `.env`
   - Check network connectivity between services

### Logs

- CMS server logs: Check terminal running `apps/cms`
- Browser console: Check for JavaScript errors
- Network tab: Verify API requests are successful

## Future Enhancements

- Folder organization system
- Bulk operations (select multiple files)
- Advanced search and filtering
- Image editing capabilities
- Usage tracking and analytics
- CDN optimization settings

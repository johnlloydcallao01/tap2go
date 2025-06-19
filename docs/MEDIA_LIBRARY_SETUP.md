# Media Library Setup Guide

This guide will help you set up the Custom Media Library with Cloudinary and Supabase integration.

## Overview

The Media Library system consists of:
- **Cloudinary**: File storage and image/video processing
- **Supabase**: Metadata storage and management
- **Webhooks**: Real-time synchronization between Cloudinary and Supabase
- **Admin Panel**: User interface for media management

## Prerequisites

1. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
3. **Ngrok** (for local development): Install from [ngrok.com](https://ngrok.com)

## Step 1: Environment Configuration

Ensure your `.env.local` file contains:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_WEBHOOK_SECRET=your_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Database Setup

1. **Run the Supabase schema script**:
   ```bash
   # The schema is already created in scripts/database/media-library.sql
   # Apply it to your Supabase project via the SQL editor
   ```

2. **Verify tables are created**:
   - `media_files`
   - `media_folders`
   - `media_tags`
   - `media_file_tags`
   - `media_collections`
   - `media_usage`

## Step 3: Cloudinary Setup

1. **Run the Cloudinary setup script**:
   ```bash
   node scripts/setup-cloudinary.js
   ```

   This will create:
   - Upload presets for the admin panel
   - Webhook configuration for real-time sync

2. **Configure webhook secret** (optional but recommended):
   - Go to Cloudinary Console > Settings > Webhooks
   - Find your webhook and copy the signing secret
   - Update `CLOUDINARY_WEBHOOK_SECRET` in `.env.local`

## Step 4: Local Development with Ngrok

For webhook testing in local development:

1. **Start your Next.js app**:
   ```bash
   npm run dev
   ```

2. **In another terminal, start ngrok**:
   ```bash
   npx ngrok http 3000
   ```

3. **Update webhook URL in Cloudinary**:
   - Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Go to Cloudinary Console > Settings > Webhooks
   - Update the notification URL to: `https://abc123.ngrok.io/api/webhooks/cloudinary`

4. **Update environment variable**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

## Step 5: Testing the Setup

1. **Access the Media Library**:
   - Go to `http://localhost:3000/admin/cms/media`
   - You should see the media library interface

2. **Test file upload**:
   - Click "Upload Files"
   - Select an image or document
   - Upload should complete and file should appear in the library

3. **Verify database sync**:
   - Check Supabase `media_files` table
   - The uploaded file metadata should be present

4. **Test webhook**:
   - Check your Next.js console for webhook logs
   - Should see "Cloudinary webhook received" messages

## API Endpoints

The media library provides these API endpoints:

- `POST /api/media/upload` - Upload files
- `GET /api/media/files` - List files with filtering
- `GET /api/media/files/[id]` - Get single file
- `PUT /api/media/files/[id]` - Update file metadata
- `DELETE /api/media/files/[id]` - Delete file
- `GET /api/media/folders` - List folders
- `POST /api/media/folders` - Create folder
- `POST /api/webhooks/cloudinary` - Cloudinary webhook handler

## Features

### File Management
- Upload images, videos, and documents
- Organize files in folders
- Add metadata (alt text, captions, descriptions)
- Tag files for better organization
- Search and filter files

### Image Processing
- Automatic thumbnail generation
- Image optimization and format conversion
- Responsive image URLs
- Advanced transformations via Cloudinary

### Usage Tracking
- Track where files are used in the application
- Prevent deletion of files in use
- Usage statistics and analytics

### Security
- Signed uploads for admin panel
- File type and size validation
- Webhook signature verification
- Role-based access control

## Troubleshooting

### Webhook Issues
1. **Webhook not receiving data**:
   - Check ngrok is running and URL is correct
   - Verify webhook URL in Cloudinary console
   - Check Next.js console for errors

2. **Signature verification fails**:
   - Ensure `CLOUDINARY_WEBHOOK_SECRET` is set correctly
   - Check webhook signing secret in Cloudinary console

### Upload Issues
1. **Upload fails**:
   - Check file size (max 10MB)
   - Verify file type is supported
   - Check Cloudinary API credentials

2. **Files not appearing in database**:
   - Check webhook is working
   - Verify Supabase connection
   - Check API logs for errors

### Database Issues
1. **Connection errors**:
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure database schema is applied

## Production Deployment

1. **Update webhook URL**:
   - Change from ngrok URL to your production domain
   - Update in Cloudinary console and environment variables

2. **Security considerations**:
   - Use HTTPS for webhook endpoints
   - Set strong webhook secrets
   - Configure proper CORS settings
   - Enable rate limiting

3. **Performance optimization**:
   - Enable CDN for Cloudinary URLs
   - Configure image optimization settings
   - Set up database indexing
   - Monitor webhook performance

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API logs and error messages
3. Verify environment configuration
4. Test individual components (upload, webhook, database)

The media library is designed to be robust and scalable, handling thousands of files with efficient search and organization capabilities.

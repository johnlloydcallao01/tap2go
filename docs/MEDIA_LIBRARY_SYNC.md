# Media Library Full Synchronization System

This document describes the complete synchronization system between your Custom Media Library, Cloudinary, and Supabase database.

## 🎯 Overview

The media library now provides **full bidirectional synchronization** across all components:

- **Custom Media Library** (`cms/media`)
- **Cloudinary** (cloud storage)
- **Supabase** (`media_files` database table)

## ✅ Synchronization Features

### 1. Upload Synchronization ✅
**Media Library → Cloudinary → Database**

When you upload files through the Custom Media Library:
- ✅ Files are uploaded to Cloudinary using the `tap2go-uploads` preset (folder: `main-uploads`)
- ✅ Metadata is saved to the `media_files` database table
- ✅ If database save fails, Cloudinary upload is automatically cleaned up
- ✅ Real-time UI updates show new files immediately

### 2. Soft Delete Synchronization ✅
**Media Library → Cloudinary → Database**

When you soft delete files from the Custom Media Library:
- ✅ Files are deleted from Cloudinary
- ✅ Database records are marked as deleted (`status: 'deleted'`, `deleted_at` timestamp)
- ✅ Real-time UI updates remove files from the interface immediately

### 3. Hard Delete Synchronization ✅
**Media Library → Cloudinary → Database**

When you permanently delete files from the Custom Media Library:
- ✅ Files are deleted from Cloudinary
- ✅ Database records are permanently removed
- ✅ All related records (tags, usage, etc.) are cleaned up
- ✅ Real-time UI updates remove files from the interface immediately

### 4. Database Delete → Cloudinary Cleanup ✅
**Database → Cleanup Queue → Cloudinary**

When you delete records directly from the `media_files` database:
- ✅ Database trigger automatically queues Cloudinary cleanup
- ✅ Background processor deletes files from Cloudinary every 30 seconds
- ✅ Real-time UI updates remove files from the interface immediately
- ✅ Failed deletions are retried automatically

### 5. Real-time UI Synchronization ✅
**Database Changes → Live UI Updates**

- ✅ Supabase real-time subscriptions detect all database changes
- ✅ UI automatically updates without manual refresh
- ✅ Works for all operations: INSERT, UPDATE, DELETE

## 🏗️ Architecture

### Components

1. **MediaLibraryService** (`src/lib/services/mediaLibraryService.ts`)
   - Handles upload/delete operations
   - Manages Cloudinary integration
   - Coordinates database operations

2. **CloudinaryCleanupService** (`src/lib/services/cloudinaryCleanupService.ts`)
   - Processes cleanup queue
   - Handles failed deletion retries
   - Manages cleanup statistics

3. **Database Triggers** (`scripts/database/cloudinary-sync-triggers.sql`)
   - Automatically queue Cloudinary deletions
   - Trigger on direct database deletions

4. **Real-time Subscriptions** (`src/hooks/useMediaLibrary.ts`)
   - Listen for database changes
   - Update UI in real-time
   - Process cleanup queue automatically

### Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Custom Media   │    │   Cloudinary    │    │   Supabase      │
│    Library      │    │   (Storage)     │    │  (Database)     │
│   cms/media     │    │                 │    │  media_files    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ Upload File           │                       │
         ├──────────────────────►│                       │
         │                       │ Save Metadata         │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
         │ Delete File           │                       │
         ├──────────────────────►│                       │
         │                       │ Update Status         │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
         │                       │ Direct Delete         │
         │                       │ ┌─────────────────────┤
         │                       │ │ Trigger Cleanup     │
         │                       │ │ Queue               │
         │                       │ └─────────────────────┤
         │                       │ Background Process    │
         │                       ◄───────────────────────┤
         │                       │                       │
         │ Real-time Updates     │                       │
         ◄───────────────────────┼───────────────────────┤
```

## 🚀 Setup Instructions

### 1. Apply Database Changes

Run the database setup script:

```bash
# Apply the Cloudinary sync triggers
node scripts/setup-cloudinary-sync.js
```

Or manually run the SQL in Supabase SQL Editor:
```sql
-- Copy and paste contents of scripts/database/cloudinary-sync-triggers.sql
```

### 2. Verify Setup

Run the comprehensive test suite:

```bash
# Test all synchronization features
node scripts/test-media-sync.js
```

### 3. Monitor Cleanup Queue

Check cleanup queue status via API:

```bash
# Get queue statistics
curl http://localhost:3000/api/media/cleanup-cloudinary

# Process queue manually
curl -X POST http://localhost:3000/api/media/cleanup-cloudinary \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "retryFailed": true}'
```

## 📊 Monitoring

### Cleanup Queue Statistics

The system provides detailed statistics about the cleanup queue:

- **Pending**: Items waiting to be processed
- **Processing**: Items currently being processed
- **Completed**: Successfully processed items
- **Failed**: Items that failed (will be retried)

### Real-time Processing

- Cleanup queue is processed every 30 seconds automatically
- Failed items are retried up to 3 times
- Old completed records are cleaned up after 30 days

## 🔧 Configuration

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cleanup Queue Settings

You can adjust these settings in the `useMediaLibrary` hook:

```typescript
// Process cleanup queue every 30 seconds (default)
const CLEANUP_INTERVAL = 30000;

// Batch size for processing (default: 5)
const CLEANUP_BATCH_SIZE = 5;

// Maximum retries for failed items (default: 3)
const MAX_RETRIES = 3;
```

## 🧪 Testing Scenarios

### Test Upload Sync
1. Upload a file through Custom Media Library
2. Verify file appears in Cloudinary
3. Verify record appears in database
4. Verify file appears in UI immediately

### Test Delete Sync
1. Delete a file through Custom Media Library
2. Verify file is removed from Cloudinary
3. Verify record is updated/removed in database
4. Verify file disappears from UI immediately

### Test Database Direct Delete
1. Delete a record directly from `media_files` table
2. Verify cleanup queue item is created
3. Wait 30 seconds for processing
4. Verify file is removed from Cloudinary
5. Verify file disappears from UI immediately

## 🚨 Troubleshooting

### Common Issues

1. **Cleanup queue not processing**
   - Check if triggers are installed
   - Verify API endpoint is accessible
   - Check browser console for errors

2. **Real-time updates not working**
   - Verify Supabase real-time is enabled
   - Check browser console for subscription errors
   - Ensure proper authentication

3. **Cloudinary deletions failing**
   - Verify Cloudinary credentials
   - Check API rate limits
   - Review error messages in cleanup queue

### Debug Commands

```bash
# Check cleanup queue status
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('cloudinary_cleanup_queue').select('*').then(console.log);
"

# Process cleanup queue manually
curl -X POST http://localhost:3000/api/media/cleanup-cloudinary
```

## 🎉 Success!

Your media library now has **complete bidirectional synchronization**:

- ✅ All uploads sync across all systems
- ✅ All deletions sync across all systems  
- ✅ Direct database changes trigger Cloudinary cleanup
- ✅ Real-time UI updates work automatically
- ✅ Failed operations are retried automatically
- ✅ System is self-healing and robust

The synchronization is now **truly complete** and **fully automated**!






SETUP

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

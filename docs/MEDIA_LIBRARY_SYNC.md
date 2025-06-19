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

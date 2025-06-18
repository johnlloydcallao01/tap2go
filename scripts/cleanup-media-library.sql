-- ========================================
-- MEDIA LIBRARY CLEANUP SCRIPT
-- ========================================
-- Run this in your Supabase SQL Editor to completely remove
-- the media library schema and Cloudinary cleanup triggers

-- ========================================
-- STEP 1: DROP TRIGGERS FIRST
-- ========================================

-- Drop Cloudinary cleanup triggers
DROP TRIGGER IF EXISTS trigger_cloudinary_cleanup ON media_files;
DROP TRIGGER IF EXISTS trigger_auto_cleanup_deleted_file ON media_files;

-- Drop media library triggers
DROP TRIGGER IF EXISTS update_media_files_search_vector ON media_files;
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
DROP TRIGGER IF EXISTS update_media_tags_updated_at ON media_tags;
DROP TRIGGER IF EXISTS update_media_collections_updated_at ON media_collections;
DROP TRIGGER IF EXISTS update_folder_stats_on_file_change ON media_files;
DROP TRIGGER IF EXISTS update_tag_usage_on_tag_assignment ON media_file_tags;
DROP TRIGGER IF EXISTS update_usage_tracking_on_usage_insert ON media_usage;

-- ========================================
-- STEP 2: DROP FUNCTIONS
-- ========================================

-- Drop Cloudinary cleanup function
DROP FUNCTION IF EXISTS cleanup_cloudinary_only();

-- Drop media library functions
DROP FUNCTION IF EXISTS update_media_search_vector();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_folder_stats();
DROP FUNCTION IF EXISTS update_tag_usage_count();
DROP FUNCTION IF EXISTS update_media_usage_tracking();
DROP FUNCTION IF EXISTS soft_delete_media_file(INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS restore_media_file(INTEGER);
DROP FUNCTION IF EXISTS permanent_delete_media_file(INTEGER);
DROP FUNCTION IF EXISTS get_folder_path(INTEGER);
DROP FUNCTION IF EXISTS track_media_usage(INTEGER, VARCHAR, VARCHAR, VARCHAR, JSONB);

-- ========================================
-- STEP 3: DROP VIEWS
-- ========================================

DROP VIEW IF EXISTS active_media_files;
DROP VIEW IF EXISTS media_library_stats;
DROP VIEW IF EXISTS folder_hierarchy;

-- ========================================
-- STEP 4: DROP TABLES (IN DEPENDENCY ORDER)
-- ========================================

-- Drop relationship tables first
DROP TABLE IF EXISTS media_file_tags;
DROP TABLE IF EXISTS media_collection_items;
DROP TABLE IF EXISTS media_usage;
DROP TABLE IF EXISTS media_processing_jobs;

-- Drop main tables
DROP TABLE IF EXISTS media_files;
DROP TABLE IF EXISTS media_folders;
DROP TABLE IF EXISTS media_tags;
DROP TABLE IF EXISTS media_collections;

-- ========================================
-- STEP 5: CLEANUP EXTENSIONS (OPTIONAL)
-- ========================================

-- Note: Only drop these if you're not using them elsewhere
-- DROP EXTENSION IF EXISTS pg_net;
-- DROP EXTENSION IF EXISTS pg_trgm;
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ========================================
-- VERIFICATION
-- ========================================

-- Check that all media library tables are gone
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'media_%'
ORDER BY table_name;

-- Check that all media library functions are gone
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_name LIKE 'media_%' 
       OR routine_name LIKE '%media%'
       OR routine_name = 'cleanup_cloudinary_only')
ORDER BY routine_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Media library cleanup completed successfully!';
  RAISE NOTICE '📋 All media library tables, functions, triggers, and views have been removed.';
  RAISE NOTICE '🔍 Check the verification queries above to confirm cleanup.';
END $$;

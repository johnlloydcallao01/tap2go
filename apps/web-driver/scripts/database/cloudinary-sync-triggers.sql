-- ========================================
-- CLOUDINARY SYNC TRIGGERS
-- ========================================
-- This script creates database triggers that automatically
-- sync deletions with Cloudinary when records are deleted
-- directly from the media_files table

-- ========================================
-- STEP 1: CREATE CLOUDINARY CLEANUP FUNCTION
-- ========================================

-- Function to call Cloudinary API for file deletion
-- This uses Supabase's pg_net extension to make HTTP requests
CREATE OR REPLACE FUNCTION cleanup_cloudinary_file()
RETURNS TRIGGER AS $$
DECLARE
    cloudinary_url TEXT;
    cloudinary_api_key TEXT;
    cloudinary_api_secret TEXT;
    cloudinary_cloud_name TEXT;
    auth_string TEXT;
    api_url TEXT;
    response_data JSONB;
BEGIN
    -- Only process if the record has a cloudinary_public_id
    IF OLD.cloudinary_public_id IS NULL OR OLD.cloudinary_public_id = '' THEN
        RETURN OLD;
    END IF;

    -- Get Cloudinary credentials from environment
    -- Note: In production, these should be stored securely
    -- For now, we'll log the deletion attempt and let the application handle it
    
    -- Log the deletion for debugging
    RAISE NOTICE 'Cloudinary cleanup triggered for public_id: %', OLD.cloudinary_public_id;
    
    -- Insert into a cleanup queue table for the application to process
    -- This is safer than making direct HTTP calls from the database
    INSERT INTO cloudinary_cleanup_queue (
        cloudinary_public_id,
        original_filename,
        deleted_at,
        trigger_source
    ) VALUES (
        OLD.cloudinary_public_id,
        OLD.original_filename,
        NOW(),
        'database_trigger'
    );
    
    RETURN OLD;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the deletion
        RAISE WARNING 'Cloudinary cleanup failed for %: %', OLD.cloudinary_public_id, SQLERRM;
        RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: CREATE CLEANUP QUEUE TABLE
-- ========================================

-- Table to queue Cloudinary cleanup operations
CREATE TABLE IF NOT EXISTS cloudinary_cleanup_queue (
    id SERIAL PRIMARY KEY,
    cloudinary_public_id VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    trigger_source VARCHAR(100) DEFAULT 'unknown',
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_cloudinary_cleanup_status ON cloudinary_cleanup_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_cloudinary_cleanup_public_id ON cloudinary_cleanup_queue(cloudinary_public_id);

-- ========================================
-- STEP 3: CREATE TRIGGERS
-- ========================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_cloudinary_cleanup_on_delete ON media_files;
DROP TRIGGER IF EXISTS trigger_cloudinary_cleanup_on_hard_delete ON media_files;

-- Trigger for hard deletes (when records are actually removed from the table)
CREATE TRIGGER trigger_cloudinary_cleanup_on_delete
    AFTER DELETE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_cloudinary_file();

-- ========================================
-- STEP 4: CREATE CLEANUP PROCESSING FUNCTION
-- ========================================

-- Function to process the cleanup queue (to be called by the application)
CREATE OR REPLACE FUNCTION process_cloudinary_cleanup_queue(
    batch_size INTEGER DEFAULT 10
) RETURNS TABLE(
    processed_count INTEGER,
    failed_count INTEGER,
    pending_count INTEGER
) AS $$
DECLARE
    processed INTEGER := 0;
    failed INTEGER := 0;
    pending INTEGER;
BEGIN
    -- Get pending count
    SELECT COUNT(*) INTO pending FROM cloudinary_cleanup_queue WHERE status = 'pending';
    
    -- Mark items as processing (to prevent concurrent processing)
    UPDATE cloudinary_cleanup_queue 
    SET status = 'processing', processed_at = NOW()
    WHERE id IN (
        SELECT id FROM cloudinary_cleanup_queue 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT batch_size
    );
    
    -- Return counts (actual processing will be done by the application)
    RETURN QUERY SELECT processed, failed, pending;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: HELPER FUNCTIONS
-- ========================================

-- Function to mark cleanup as completed
CREATE OR REPLACE FUNCTION mark_cloudinary_cleanup_completed(
    cleanup_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cloudinary_cleanup_queue 
    SET status = 'completed', processed_at = NOW()
    WHERE id = cleanup_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark cleanup as failed
CREATE OR REPLACE FUNCTION mark_cloudinary_cleanup_failed(
    cleanup_id INTEGER,
    error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cloudinary_cleanup_queue 
    SET 
        status = 'failed', 
        processed_at = NOW(),
        error_message = error_msg,
        retry_count = retry_count + 1
    WHERE id = cleanup_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed cleanups
CREATE OR REPLACE FUNCTION retry_failed_cloudinary_cleanups(
    max_retries INTEGER DEFAULT 3
) RETURNS INTEGER AS $$
DECLARE
    retry_count INTEGER;
BEGIN
    UPDATE cloudinary_cleanup_queue 
    SET status = 'pending', processed_at = NULL
    WHERE status = 'failed' AND retry_count < max_retries;
    
    GET DIAGNOSTICS retry_count = ROW_COUNT;
    RETURN retry_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: CLEANUP OLD RECORDS
-- ========================================

-- Function to clean up old completed records
CREATE OR REPLACE FUNCTION cleanup_old_cloudinary_queue_records(
    days_old INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cloudinary_cleanup_queue 
    WHERE status = 'completed' 
    AND processed_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICATION AND SETUP COMPLETE
-- ========================================

-- Verify the trigger was created (optional - remove if causing issues)
-- DO $$
-- BEGIN
--     IF EXISTS (
--         SELECT 1 FROM information_schema.triggers
--         WHERE trigger_name = 'trigger_cloudinary_cleanup_on_delete'
--     ) THEN
--         RAISE NOTICE '✅ Cloudinary cleanup trigger created successfully!';
--     ELSE
--         RAISE NOTICE '❌ Failed to create Cloudinary cleanup trigger!';
--     END IF;
-- END $$;

-- Show current queue status (optional - remove if causing issues)
-- SELECT
--     status,
--     COUNT(*) as count,
--     MIN(created_at) as oldest,
--     MAX(created_at) as newest
-- FROM cloudinary_cleanup_queue
-- GROUP BY status
-- ORDER BY status;

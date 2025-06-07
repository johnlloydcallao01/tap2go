-- WordPress-Style Soft Delete Migration for Supabase
-- Run this in your Supabase SQL Editor to add soft delete functionality

-- ========================================
-- PHASE 1: ADD SOFT DELETE COLUMNS
-- ========================================

-- Add soft delete columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);

-- Add soft delete columns to static_pages table  
ALTER TABLE static_pages
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);

-- ========================================
-- PHASE 2: UPDATE STATUS CONSTRAINTS
-- ========================================

-- Update blog_posts status constraint to include 'trash'
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check 
CHECK (status IN ('draft', 'published', 'private', 'scheduled', 'trash'));

-- Update static_pages status constraint to include 'trash'
ALTER TABLE static_pages DROP CONSTRAINT IF EXISTS static_pages_status_check;
ALTER TABLE static_pages ADD CONSTRAINT static_pages_status_check 
CHECK (status IN ('draft', 'published', 'private', 'trash'));

-- ========================================
-- PHASE 3: CREATE PERFORMANCE INDEXES
-- ========================================

-- WordPress-style soft delete indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_trash ON blog_posts(deleted_at DESC) WHERE deleted_at IS NOT NULL;

-- WordPress-style soft delete indexes for static_pages
CREATE INDEX IF NOT EXISTS idx_static_pages_deleted_at ON static_pages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_static_pages_active ON static_pages(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_static_pages_trash ON static_pages(deleted_at DESC) WHERE deleted_at IS NOT NULL;

-- ========================================
-- PHASE 4: CREATE HELPER FUNCTIONS
-- ========================================

-- Function to soft delete a blog post (WordPress-style)
CREATE OR REPLACE FUNCTION soft_delete_blog_post(
  post_id INTEGER,
  user_id VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE blog_posts 
  SET 
    deleted_at = NOW(),
    deleted_by = user_id,
    status = 'trash',
    updated_at = NOW()
  WHERE id = post_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a blog post from trash
CREATE OR REPLACE FUNCTION restore_blog_post(
  post_id INTEGER,
  new_status VARCHAR(20) DEFAULT 'draft'
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE blog_posts 
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    status = new_status,
    updated_at = NOW()
  WHERE id = post_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to permanently delete a blog post (hard delete)
CREATE OR REPLACE FUNCTION permanent_delete_blog_post(
  post_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow permanent deletion of trashed posts
  DELETE FROM blog_posts 
  WHERE id = post_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete a static page (WordPress-style)
CREATE OR REPLACE FUNCTION soft_delete_static_page(
  page_id INTEGER,
  user_id VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE static_pages 
  SET 
    deleted_at = NOW(),
    deleted_by = user_id,
    status = 'trash',
    updated_at = NOW()
  WHERE id = page_id AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a static page from trash
CREATE OR REPLACE FUNCTION restore_static_page(
  page_id INTEGER,
  new_status VARCHAR(20) DEFAULT 'draft'
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE static_pages 
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    status = new_status,
    updated_at = NOW()
  WHERE id = page_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to permanently delete a static page (hard delete)
CREATE OR REPLACE FUNCTION permanent_delete_static_page(
  page_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow permanent deletion of trashed pages
  DELETE FROM static_pages 
  WHERE id = page_id AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PHASE 5: CREATE VIEWS FOR EASY QUERYING
-- ========================================

-- View for active (non-deleted) blog posts
CREATE OR REPLACE VIEW active_blog_posts AS
SELECT * FROM blog_posts 
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- View for trashed blog posts
CREATE OR REPLACE VIEW trashed_blog_posts AS
SELECT * FROM blog_posts 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- View for active (non-deleted) static pages
CREATE OR REPLACE VIEW active_static_pages AS
SELECT * FROM static_pages 
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- View for trashed static pages
CREATE OR REPLACE VIEW trashed_static_pages AS
SELECT * FROM static_pages 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if migration was successful
SELECT 
  'blog_posts' as table_name,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_posts,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as trashed_posts
FROM blog_posts
UNION ALL
SELECT 
  'static_pages' as table_name,
  COUNT(*) as total_pages,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_pages,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as trashed_pages
FROM static_pages;

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('blog_posts', 'static_pages') 
  AND column_name IN ('deleted_at', 'deleted_by', 'status')
ORDER BY table_name, column_name;

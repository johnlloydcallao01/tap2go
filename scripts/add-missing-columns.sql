-- Add Missing Columns to Complete WordPress-Style CMS
-- Run this in Supabase SQL Editor

-- Add missing columns to blog_posts
DO $$ 
BEGIN
  -- Add is_sticky column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='is_sticky') THEN
    ALTER TABLE blog_posts ADD COLUMN is_sticky BOOLEAN DEFAULT false;
  END IF;
  
  -- Add comment_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='comment_status') THEN
    ALTER TABLE blog_posts ADD COLUMN comment_status VARCHAR(20) DEFAULT 'open';
  END IF;
  
  -- Add scheduled_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='scheduled_at') THEN
    ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add featured_image_alt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured_image_alt') THEN
    ALTER TABLE blog_posts ADD COLUMN featured_image_alt TEXT;
  END IF;
END $$;

-- Add missing columns to static_pages
DO $$ 
BEGIN
  -- Add parent_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='parent_id') THEN
    ALTER TABLE static_pages ADD COLUMN parent_id INTEGER REFERENCES static_pages(id) ON DELETE SET NULL;
  END IF;
  
  -- Add menu_order column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='menu_order') THEN
    ALTER TABLE static_pages ADD COLUMN menu_order INTEGER DEFAULT 0;
  END IF;
  
  -- Add featured_image_url column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='featured_image_url') THEN
    ALTER TABLE static_pages ADD COLUMN featured_image_url TEXT;
  END IF;
  
  -- Add featured_image_alt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='featured_image_alt') THEN
    ALTER TABLE static_pages ADD COLUMN featured_image_alt TEXT;
  END IF;
  
  -- Add meta_title column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='meta_title') THEN
    ALTER TABLE static_pages ADD COLUMN meta_title VARCHAR(255);
  END IF;
  
  -- Add meta_description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='meta_description') THEN
    ALTER TABLE static_pages ADD COLUMN meta_description TEXT;
  END IF;
  
  -- Add show_in_navigation column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='show_in_navigation') THEN
    ALTER TABLE static_pages ADD COLUMN show_in_navigation BOOLEAN DEFAULT false;
  END IF;
  
  -- Add navigation_label column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='navigation_label') THEN
    ALTER TABLE static_pages ADD COLUMN navigation_label VARCHAR(255);
  END IF;
  
  -- Add page_template column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='page_template') THEN
    ALTER TABLE static_pages ADD COLUMN page_template VARCHAR(100) DEFAULT 'default';
  END IF;
END $$;

-- Verify the additions
SELECT 'SUCCESS: Missing columns added!' as status;

-- Show updated structure
SELECT 
  'blog_posts' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts'
  AND column_name IN ('is_sticky', 'comment_status', 'scheduled_at', 'featured_image_alt')
UNION ALL
SELECT 
  'static_pages' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'static_pages'
  AND column_name IN ('parent_id', 'menu_order', 'show_in_navigation', 'page_template')
ORDER BY table_name, column_name;

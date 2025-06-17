
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Core Tables
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  featured_image_url TEXT,
  featured_image_alt TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  author_name VARCHAR(255) NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_sticky BOOLEAN DEFAULT false,
  comment_status VARCHAR(20) DEFAULT 'open',
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to blog_posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_id') THEN
    ALTER TABLE blog_posts ADD COLUMN author_id VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_email') THEN
    ALTER TABLE blog_posts ADD COLUMN author_email VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author_avatar_url') THEN
    ALTER TABLE blog_posts ADD COLUMN author_avatar_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='search_vector') THEN
    ALTER TABLE blog_posts ADD COLUMN search_vector tsvector;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='deleted_at') THEN
    ALTER TABLE blog_posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='deleted_by') THEN
    ALTER TABLE blog_posts ADD COLUMN deleted_by VARCHAR(255);
  END IF;
END $$;

-- Status constraints
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_status_check
CHECK (status IN ('draft', 'published', 'private', 'scheduled', 'trash'));
CREATE TABLE IF NOT EXISTS static_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  parent_id INTEGER REFERENCES static_pages(id) ON DELETE SET NULL,
  menu_order INTEGER DEFAULT 0,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  show_in_navigation BOOLEAN DEFAULT false,
  navigation_label VARCHAR(255),
  page_template VARCHAR(100) DEFAULT 'default',
  author_name VARCHAR(255) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to static_pages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='author_id') THEN
    ALTER TABLE static_pages ADD COLUMN author_id VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='search_vector') THEN
    ALTER TABLE static_pages ADD COLUMN search_vector tsvector;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='deleted_at') THEN
    ALTER TABLE static_pages ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='deleted_by') THEN
    ALTER TABLE static_pages ADD COLUMN deleted_by VARCHAR(255);
  END IF;
END $$;

ALTER TABLE static_pages DROP CONSTRAINT IF EXISTS static_pages_status_check;
ALTER TABLE static_pages ADD CONSTRAINT static_pages_status_check
CHECK (status IN ('draft', 'published', 'private', 'trash'));

-- Relationship tables
CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_trash ON blog_posts(deleted_at DESC) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='search_vector') THEN
    CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_status ON static_pages(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_static_pages_parent ON static_pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_static_pages_navigation ON static_pages(show_in_navigation, menu_order);
CREATE INDEX IF NOT EXISTS idx_static_pages_deleted_at ON static_pages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_static_pages_active ON static_pages(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_static_pages_trash ON static_pages(deleted_at DESC) WHERE deleted_at IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='static_pages' AND column_name='search_vector') THEN
    CREATE INDEX IF NOT EXISTS idx_static_pages_search ON static_pages USING gin(search_vector);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Functions
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'blog_posts' THEN
        NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '') || ' ' || COALESCE(NEW.excerpt, ''));
    ELSIF TG_TABLE_NAME = 'static_pages' THEN
        NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, '') || ' ' || COALESCE(NEW.excerpt, ''));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_blog_posts_search_vector ON blog_posts;
DROP TRIGGER IF EXISTS update_static_pages_search_vector ON static_pages;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_static_pages_updated_at ON static_pages;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;

CREATE TRIGGER update_blog_posts_search_vector BEFORE INSERT OR UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_static_pages_search_vector BEFORE INSERT OR UPDATE ON static_pages FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_static_pages_updated_at BEFORE UPDATE ON static_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper functions
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

CREATE OR REPLACE FUNCTION permanent_delete_blog_post(
  post_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM blog_posts
  WHERE id = post_id AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Views
CREATE OR REPLACE VIEW active_blog_posts AS
SELECT * FROM blog_posts
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW trashed_blog_posts AS
SELECT * FROM blog_posts
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- Additional columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='is_sticky') THEN
    ALTER TABLE blog_posts ADD COLUMN is_sticky BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='comment_status') THEN
    ALTER TABLE blog_posts ADD COLUMN comment_status VARCHAR(20) DEFAULT 'open';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='scheduled_at') THEN
    ALTER TABLE blog_posts ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured_image_alt') THEN
    ALTER TABLE blog_posts ADD COLUMN featured_image_alt TEXT;
  END IF;
END $$;

-- Security settings
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags DISABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON static_pages TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON tags TO authenticated;
GRANT ALL ON post_categories TO authenticated;
GRANT ALL ON post_tags TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON blog_posts TO anon;
GRANT SELECT ON static_pages TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON tags TO anon;
GRANT SELECT ON post_categories TO anon;
GRANT SELECT ON post_tags TO anon;
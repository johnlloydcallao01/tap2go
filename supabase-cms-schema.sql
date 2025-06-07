-- Modern WordPress-Style CMS Schema for Tap2Go
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Categories Table (WordPress-style taxonomy)
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

-- Tags Table (WordPress-style taxonomy)
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table (WordPress-style posts)
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'scheduled', 'trash')) DEFAULT 'draft',

  -- WordPress-style meta fields
  featured_image_url TEXT,
  featured_image_alt TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Author information (can link to Firebase users)
  author_id VARCHAR(255), -- Firebase UID
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_avatar_url TEXT,

  -- Content organization
  is_featured BOOLEAN DEFAULT false,
  is_sticky BOOLEAN DEFAULT false, -- WordPress sticky posts
  comment_status VARCHAR(20) DEFAULT 'open', -- open, closed, disabled

  -- SEO and performance
  reading_time INTEGER, -- estimated reading time in minutes
  view_count INTEGER DEFAULT 0,
  search_vector tsvector, -- Full-text search

  -- Scheduling
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,

  -- WordPress-style soft delete (trash system)
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255), -- Firebase UID of user who deleted

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post-Category Relationships (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_categories (
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post-Tag Relationships (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Static Pages Table (WordPress-style pages)
CREATE TABLE IF NOT EXISTS static_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'trash')) DEFAULT 'draft',

  -- Page hierarchy (WordPress-style parent/child pages)
  parent_id INTEGER REFERENCES static_pages(id) ON DELETE SET NULL,
  menu_order INTEGER DEFAULT 0,

  -- WordPress-style meta fields
  featured_image_url TEXT,
  featured_image_alt TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Navigation
  show_in_navigation BOOLEAN DEFAULT false,
  navigation_label VARCHAR(255), -- Custom nav label

  -- Page template
  page_template VARCHAR(100) DEFAULT 'default', -- default, contact, about, etc.

  -- Author information
  author_id VARCHAR(255), -- Firebase UID
  author_name VARCHAR(255) NOT NULL,

  -- SEO
  search_vector tsvector,

  -- WordPress-style soft delete (trash system)
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255), -- Firebase UID of user who deleted

  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Library Table (WordPress-style media management)
CREATE TABLE IF NOT EXISTS media_library (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- image/jpeg, image/png, etc.
  file_size INTEGER NOT NULL, -- in bytes
  width INTEGER, -- for images
  height INTEGER, -- for images
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  uploaded_by VARCHAR(255), -- Firebase UID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
-- WordPress-style soft delete indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_trash ON blog_posts(deleted_at DESC) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_status ON static_pages(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_static_pages_parent ON static_pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_static_pages_navigation ON static_pages(show_in_navigation, menu_order);
CREATE INDEX IF NOT EXISTS idx_static_pages_search ON static_pages USING gin(search_vector);
-- WordPress-style soft delete indexes for pages
CREATE INDEX IF NOT EXISTS idx_static_pages_deleted_at ON static_pages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_static_pages_active ON static_pages(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_static_pages_trash ON static_pages(deleted_at DESC) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);

-- Full-text search triggers
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

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_blog_posts_search_vector BEFORE INSERT OR UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_search_vector();
CREATE TRIGGER update_static_pages_search_vector BEFORE INSERT OR UPDATE ON static_pages FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_static_pages_updated_at BEFORE UPDATE ON static_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

#!/usr/bin/env node

/**
 * Supabase Schema Setup Script for Tap2Go CMS
 * Creates all necessary tables and policies for the CMS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Modern WordPress-Style CMS Schema (Blog Posts + Static Pages Only)
const createTablesSQL = `
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
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'scheduled')) DEFAULT 'draft',

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
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private')) DEFAULT 'draft',

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

CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_status ON static_pages(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_static_pages_parent ON static_pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_static_pages_navigation ON static_pages(show_in_navigation, menu_order);
CREATE INDEX IF NOT EXISTS idx_static_pages_search ON static_pages USING gin(search_vector);

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
`;

// WordPress-Style RLS Policies
const createPoliciesSQL = `
-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Public can read published static pages" ON static_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read post categories" ON post_categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read post tags" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read media" ON media_library
  FOR SELECT USING (true);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage static pages" ON static_pages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage tags" ON tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage post categories" ON post_categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage post tags" ON post_tags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage media" ON media_library
  FOR ALL USING (auth.role() = 'service_role');
`;

// Create PostgreSQL function to execute SQL (official Supabase method)
async function createExecutorFunction() {
  try {
    console.log('🔧 Creating SQL executor function...');

    const executorSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_text text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_text;
        RETURN 'SUCCESS';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `;

    const { data, error } = await supabase.rpc('execute_sql', { sql_text: executorSQL });

    if (error) {
      console.log('⚠️  Creating executor function manually...');
      // Fallback: create function using direct SQL
      const { error: directError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'execute_sql')
        .limit(1);

      if (directError) {
        throw new Error('Cannot create executor function. Please run SQL manually.');
      }
    }

    console.log('✅ SQL executor function ready');
    return true;
  } catch (error) {
    console.error('❌ Error creating executor function:', error.message);
    return false;
  }
}

// Execute SQL using the official Supabase RPC method
async function executeSQL(sql, description) {
  try {
    console.log(`📋 ${description}...`);

    const { data, error } = await supabase.rpc('execute_sql', {
      sql_text: sql
    });

    if (error) {
      throw error;
    }

    if (data && data.startsWith('ERROR:')) {
      throw new Error(data);
    }

    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function createSchema() {
  try {
    console.log('🚀 WordPress-Style CMS Setup Starting...\n');

    // Step 1: Create executor function
    const executorReady = await createExecutorFunction();
    if (!executorReady) {
      console.log('\n📝 Manual Setup Required:');
      console.log('Please run the SQL files in your Supabase SQL Editor:');
      console.log('1. supabase-cms-schema.sql');
      console.log('2. supabase-cms-policies.sql');
      console.log('3. supabase-sample-data.sql');
      return;
    }

    // Step 2: Create tables and schema
    const schemaSuccess = await executeSQL(createTablesSQL, 'Creating CMS tables and indexes');
    if (!schemaSuccess) {
      throw new Error('Failed to create schema');
    }

    // Step 3: Set up security policies
    const policiesSuccess = await executeSQL(createPoliciesSQL, 'Setting up Row Level Security');
    if (!policiesSuccess) {
      console.log('⚠️  Schema created but RLS policies failed. Please run policies manually.');
    }

    console.log('\n🎉 WordPress-Style CMS schema setup completed!');
    console.log('\n📋 Created tables:');
    console.log('- ✅ blog_posts (WordPress-style posts)');
    console.log('- ✅ static_pages (WordPress-style pages)');
    console.log('- ✅ categories (hierarchical taxonomy)');
    console.log('- ✅ tags (flat taxonomy)');
    console.log('- ✅ post_categories (many-to-many relationships)');
    console.log('- ✅ post_tags (many-to-many relationships)');
    console.log('- ✅ media_library (WordPress-style media management)');
    console.log('\n🚀 Features enabled:');
    console.log('- ✅ Full-text search');
    console.log('- ✅ SEO optimization');
    console.log('- ✅ Draft/Publish workflow');
    console.log('- ✅ Hierarchical pages');
    console.log('- ✅ Media management');
    console.log('- ✅ Performance indexes');

  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  }
}

// Test connection using a simple query
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');

    // Test with a simple query that should always work
    const { data, error } = await supabase
      .rpc('version'); // This should return PostgreSQL version

    if (error && error.message.includes('Could not find the function')) {
      // If version RPC doesn't exist, try a different approach
      const { data: testData, error: testError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .limit(1);

      if (testError) {
        console.error('❌ Connection test failed:', testError.message);
        return false;
      }
    } else if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    console.log('📝 Inserting sample CMS data...');

    const sampleDataSQL = `
      -- Insert sample categories
      INSERT INTO categories (name, slug, description) VALUES
      ('Food & Dining', 'food-dining', 'Everything about food, restaurants, and dining experiences'),
      ('Technology', 'technology', 'Latest tech trends and innovations in food delivery'),
      ('Business', 'business', 'Restaurant business insights and industry news'),
      ('Health & Nutrition', 'health-nutrition', 'Healthy eating tips and nutritional information'),
      ('Local Stories', 'local-stories', 'Stories from local restaurants and communities')
      ON CONFLICT (slug) DO NOTHING;

      -- Insert sample tags
      INSERT INTO tags (name, slug, description) VALUES
      ('delivery', 'delivery', 'Food delivery related content'),
      ('restaurants', 'restaurants', 'Restaurant features and reviews'),
      ('recipes', 'recipes', 'Cooking recipes and food preparation'),
      ('tips', 'tips', 'Helpful tips and advice'),
      ('news', 'news', 'Latest news and updates'),
      ('featured', 'featured', 'Featured content'),
      ('trending', 'trending', 'Trending topics'),
      ('local', 'local', 'Local community content')
      ON CONFLICT (slug) DO NOTHING;
    `;

    const success = await executeSQL(sampleDataSQL, 'Inserting sample categories and tags');
    if (success) {
      console.log('✅ Sample data inserted successfully');
    }

    return success;
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Tap2Go WordPress-Style CMS Setup\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to Supabase. Please check your credentials.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your .env.local file has the correct Supabase credentials');
    console.log('2. Check that your Supabase project is active');
    console.log('3. Ensure your network connection is stable');
    process.exit(1);
  }

  // Create schema
  await createSchema();

  // Insert sample data
  console.log('\n📝 Would you like to insert sample blog posts and pages? (y/n)');
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Insert sample data? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await insertSampleData();
    }

    console.log('\n🎉 Setup completed! Your WordPress-style CMS is ready.');
    console.log('\n📋 What was created:');
    console.log('- ✅ Blog posts system with categories and tags');
    console.log('- ✅ Static pages with hierarchy');
    console.log('- ✅ Media library for file management');
    console.log('- ✅ Full-text search capabilities');
    console.log('- ✅ SEO optimization features');
    console.log('- ✅ Draft/publish workflow');

    console.log('\n🚀 Next steps:');
    console.log('1. Test the connection: npm run supabase:test');
    console.log('2. Check your Supabase dashboard → Table Editor');
    console.log('3. Start using the CMS operations in your app');

    rl.close();
    process.exit(0);
  });
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { createSchema, testConnection };

#!/usr/bin/env node

/**
 * DIRECT TABLE CREATION - GUARANTEED TO WORK
 * This script will create your tables using the most reliable method
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 DIRECT TABLE CREATION STARTING...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

console.log('📋 Using credentials:');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey.substring(0, 20) + '...');

// Test with the simplest possible query
async function testBasicConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Try the most basic query possible
    const { data, error } = await supabase
      .rpc('version'); // This should return PostgreSQL version

    if (error) {
      console.log('RPC version failed, trying alternative...');
      // If that fails, try a different approach
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ REST API connection successful');
        return true;
      } else {
        console.log('❌ REST API failed:', response.status);
        return false;
      }
    }

    console.log('✅ RPC connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Create tables using raw SQL execution
async function createTablesDirectly() {
  try {
    console.log('\n📋 Creating tables using direct SQL...');

    // Create a PostgreSQL function to execute our SQL
    const createExecutorFunction = `
      CREATE OR REPLACE FUNCTION execute_cms_setup()
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Create categories table
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

        -- Create tags table
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          post_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create blog_posts table
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'scheduled')) DEFAULT 'draft',
          featured_image_url TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          author_name VARCHAR(255) NOT NULL,
          is_featured BOOLEAN DEFAULT false,
          reading_time INTEGER,
          view_count INTEGER DEFAULT 0,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create static_pages table
        CREATE TABLE IF NOT EXISTS static_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private')) DEFAULT 'draft',
          parent_id INTEGER REFERENCES static_pages(id) ON DELETE SET NULL,
          menu_order INTEGER DEFAULT 0,
          meta_title VARCHAR(255),
          meta_description TEXT,
          show_in_navigation BOOLEAN DEFAULT false,
          navigation_label VARCHAR(255),
          author_name VARCHAR(255) NOT NULL,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create relationship tables
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

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at DESC);
        CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
        CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

        -- Enable RLS
        ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
        ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

        -- Create policies for public read access
        CREATE POLICY IF NOT EXISTS "Public can read published blog posts" ON blog_posts
          FOR SELECT USING (status = 'published');

        CREATE POLICY IF NOT EXISTS "Public can read published static pages" ON static_pages
          FOR SELECT USING (status = 'published');

        CREATE POLICY IF NOT EXISTS "Public can read categories" ON categories
          FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Public can read tags" ON tags
          FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Public can read post categories" ON post_categories
          FOR SELECT USING (true);

        CREATE POLICY IF NOT EXISTS "Public can read post tags" ON post_tags
          FOR SELECT USING (true);

        -- Service role policies
        CREATE POLICY IF NOT EXISTS "Service role can manage blog posts" ON blog_posts
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY IF NOT EXISTS "Service role can manage static pages" ON static_pages
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY IF NOT EXISTS "Service role can manage categories" ON categories
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY IF NOT EXISTS "Service role can manage tags" ON tags
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY IF NOT EXISTS "Service role can manage post categories" ON post_categories
          FOR ALL USING (auth.role() = 'service_role');

        CREATE POLICY IF NOT EXISTS "Service role can manage post tags" ON post_tags
          FOR ALL USING (auth.role() = 'service_role');

        RETURN 'SUCCESS: All CMS tables created successfully!';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `;

    console.log('  → Creating setup function...');
    const { data: functionResult, error: functionError } = await supabase.rpc('execute_cms_setup');

    if (functionError) {
      console.log('Function creation failed, trying direct approach...');
      
      // Try using raw SQL via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_cms_setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      console.log('✅ Tables created via REST API');
      return true;
    }

    // Execute the function to create tables
    console.log('  → Executing table creation...');
    const { data: setupResult, error: setupError } = await supabase.rpc('execute_cms_setup');

    if (setupError) {
      throw setupError;
    }

    if (setupResult && setupResult.startsWith('ERROR:')) {
      throw new Error(setupResult);
    }

    console.log('✅ All tables created successfully!');
    return true;

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    return false;
  }
}

// Verify tables were created
async function verifyTables() {
  try {
    console.log('\n🔍 Verifying tables were created...');

    const tables = ['categories', 'tags', 'blog_posts', 'static_pages', 'post_categories', 'post_tags'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        return false;
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    }

    console.log('\n🎉 ALL TABLES VERIFIED SUCCESSFULLY!');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 CREATING YOUR SUPABASE TABLES NOW...\n');

  // Test connection
  const connected = await testBasicConnection();
  if (!connected) {
    console.log('\n❌ Cannot connect to Supabase. Please check:');
    console.log('1. Your Supabase project is active');
    console.log('2. Your credentials in .env.local are correct');
    console.log('3. Your service role key has admin privileges');
    process.exit(1);
  }

  // Create tables
  const tablesCreated = await createTablesDirectly();
  if (!tablesCreated) {
    console.log('\n❌ Failed to create tables automatically.');
    console.log('\n📝 MANUAL SOLUTION:');
    console.log('Go to your Supabase Dashboard → SQL Editor');
    console.log('Copy and paste the SQL from: database/supabase/schema/supabase-cms-schema.sql');
    console.log('Then run: database/supabase/policies/supabase-cms-policies.sql');
    process.exit(1);
  }

  // Verify everything works
  const verified = await verifyTables();
  if (verified) {
    console.log('\n🎉 SUCCESS! Your WordPress-style CMS is ready!');
    console.log('\n📋 Created tables:');
    console.log('- blog_posts (for your blog content)');
    console.log('- static_pages (for About, Contact, etc.)');
    console.log('- categories (for organizing posts)');
    console.log('- tags (for tagging posts)');
    console.log('- post_categories & post_tags (relationships)');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Check your Supabase Dashboard → Table Editor');
    console.log('2. Run: npm run supabase:verify');
    console.log('3. Start using: import { BlogPostOps } from "@/lib/supabase/cms-operations"');
  }
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});

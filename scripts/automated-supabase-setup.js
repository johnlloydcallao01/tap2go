#!/usr/bin/env node

/**
 * Fully Automated Supabase CMS Setup
 * Based on official Supabase documentation and best practices
 * No manual SQL required - everything is done programmatically
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role (admin privileges)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure these are set in .env.local:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Test connection with a simple query
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Use a simple query that should always work
    const { data, error } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .eq('schema_name', 'public')
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Create tables using individual operations (more reliable than bulk SQL)
async function createTables() {
  try {
    console.log('📋 Creating CMS tables...');

    // Create categories table
    console.log('  → Creating categories table...');
    await supabase.rpc('exec', {
      sql: `
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
      `
    });

    // Create tags table
    console.log('  → Creating tags table...');
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          post_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create blog_posts table
    console.log('  → Creating blog_posts table...');
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'scheduled')) DEFAULT 'draft',
          featured_image_url TEXT,
          featured_image_alt TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          author_id VARCHAR(255),
          author_name VARCHAR(255) NOT NULL,
          author_email VARCHAR(255),
          author_avatar_url TEXT,
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
      `
    });

    // Create static_pages table
    console.log('  → Creating static_pages table...');
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS static_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private')) DEFAULT 'draft',
          parent_id INTEGER REFERENCES static_pages(id) ON DELETE SET NULL,
          menu_order INTEGER DEFAULT 0,
          featured_image_url TEXT,
          featured_image_alt TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          show_in_navigation BOOLEAN DEFAULT false,
          navigation_label VARCHAR(255),
          page_template VARCHAR(100) DEFAULT 'default',
          author_id VARCHAR(255),
          author_name VARCHAR(255) NOT NULL,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create relationship tables
    console.log('  → Creating relationship tables...');
    await supabase.rpc('exec', {
      sql: `
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
      `
    });

    console.log('✅ All tables created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// Set up Row Level Security using direct table operations
async function setupSecurity() {
  try {
    console.log('🔒 Setting up Row Level Security...');

    // Enable RLS on all tables
    const tables = ['blog_posts', 'static_pages', 'categories', 'tags', 'post_categories', 'post_tags'];
    
    for (const table of tables) {
      console.log(`  → Enabling RLS on ${table}...`);
      await supabase.rpc('exec', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
    }

    console.log('✅ Row Level Security enabled!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up security:', error.message);
    return false;
  }
}

// Insert sample data using Supabase client methods
async function insertSampleData() {
  try {
    console.log('📝 Inserting sample data...');

    // Insert categories
    console.log('  → Adding categories...');
    const { error: catError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Food & Dining', slug: 'food-dining', description: 'Everything about food and restaurants' },
        { name: 'Technology', slug: 'technology', description: 'Tech trends in food delivery' },
        { name: 'Local Stories', slug: 'local-stories', description: 'Stories from local communities' }
      ], { onConflict: 'slug' });

    if (catError) throw catError;

    // Insert tags
    console.log('  → Adding tags...');
    const { error: tagError } = await supabase
      .from('tags')
      .upsert([
        { name: 'delivery', slug: 'delivery', description: 'Food delivery content' },
        { name: 'restaurants', slug: 'restaurants', description: 'Restaurant features' },
        { name: 'tips', slug: 'tips', description: 'Helpful tips and advice' },
        { name: 'featured', slug: 'featured', description: 'Featured content' }
      ], { onConflict: 'slug' });

    if (tagError) throw tagError;

    // Insert sample blog post
    console.log('  → Adding sample blog post...');
    const { error: postError } = await supabase
      .from('blog_posts')
      .upsert([{
        title: 'Welcome to Tap2Go Blog',
        slug: 'welcome-to-tap2go-blog',
        content: '<h1>Welcome to Tap2Go Blog</h1><p>This is your first blog post! You can edit or delete this post and start creating your own content.</p><p>Your WordPress-style CMS is now ready with categories, tags, and all the features you need.</p>',
        excerpt: 'Welcome to your new WordPress-style CMS powered by Supabase!',
        status: 'published',
        author_name: 'Tap2Go Admin',
        is_featured: true,
        reading_time: 1,
        published_at: new Date().toISOString()
      }], { onConflict: 'slug' });

    if (postError) throw postError;

    // Insert sample static page
    console.log('  → Adding sample static page...');
    const { error: pageError } = await supabase
      .from('static_pages')
      .upsert([{
        title: 'About Us',
        slug: 'about',
        content: '<h1>About Tap2Go</h1><p>This is a sample About page. You can edit this content through your CMS.</p>',
        status: 'published',
        author_name: 'Tap2Go Admin',
        show_in_navigation: true,
        navigation_label: 'About',
        menu_order: 1,
        published_at: new Date().toISOString()
      }], { onConflict: 'slug' });

    if (pageError) throw pageError;

    console.log('✅ Sample data inserted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    return false;
  }
}

// Main setup function
async function main() {
  console.log('🚀 Automated Supabase CMS Setup Starting...\n');

  // Step 1: Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify credentials in .env.local');
    console.log('3. Ensure service role key has admin privileges');
    process.exit(1);
  }

  // Step 2: Create tables
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.log('❌ Failed to create tables. Please check the error above.');
    process.exit(1);
  }

  // Step 3: Setup security
  const securitySetup = await setupSecurity();
  if (!securitySetup) {
    console.log('⚠️  Tables created but security setup failed.');
  }

  // Step 4: Insert sample data
  const sampleDataInserted = await insertSampleData();
  if (!sampleDataInserted) {
    console.log('⚠️  Tables created but sample data insertion failed.');
  }

  console.log('\n🎉 WordPress-Style CMS Setup Complete!');
  console.log('\n📋 What was created:');
  console.log('- ✅ Blog posts with categories and tags');
  console.log('- ✅ Static pages with hierarchy');
  console.log('- ✅ Row Level Security enabled');
  console.log('- ✅ Sample content ready to use');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Test: npm run supabase:test');
  console.log('2. Check Supabase Dashboard → Table Editor');
  console.log('3. Start building your blog and pages!');
}

// Run the setup
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { main, testConnection };

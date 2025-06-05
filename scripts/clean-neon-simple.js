/**
 * Simple Neon Database Cleanup Script
 * Removes all tables and creates CMS-only schema
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

/**
 * Main cleanup function
 */
async function cleanNeonDatabase() {
  try {
    console.log('🧹 Tap2Go Neon Database Cleanup\n');
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      console.log('Please add your Neon database URL to .env.local');
      process.exit(1);
    }
    
    // Initialize Neon client
    const sql = neon(process.env.DATABASE_URL);
    
    // Test connection
    console.log('🔌 Testing database connection...');
    try {
      const result = await sql`SELECT NOW() as current_time`;
      console.log('✅ Database connection successful!');
    } catch (error) {
      console.error('❌ Cannot connect to database:', error.message);
      process.exit(1);
    }
    
    // Show current tables
    console.log('\n📊 Current Database Tables:');
    try {
      const tables = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;
      
      if (tables.length === 0) {
        console.log('   No tables found (clean database)');
      } else {
        console.log(`   Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`   ✓ ${table.tablename}`);
        });
      }
    } catch (error) {
      console.log('   Could not retrieve table list');
    }
    
    // Confirm cleanup
    console.log('\n⚠️  WARNING: This will delete ALL existing tables!');
    console.log('This includes:');
    console.log('  - All Prisma business logic tables (tap2go_*)');
    console.log('  - All existing CMS tables');
    console.log('  - All custom types and enums');
    console.log('\nFirestore data will remain untouched.');
    
    const confirm = await prompt('\nAre you sure you want to proceed? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cleanup cancelled.');
      rl.close();
      return;
    }
    
    // Drop all tables
    console.log('\n🗑️  Dropping all tables...');
    try {
      // Get all table names
      const tables = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `;
      
      // Drop each table individually to avoid issues
      for (const table of tables) {
        const tableName = table.tablename;
        await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        console.log(`   Dropped: ${tableName}`);
      }
      
      // Drop custom types
      await sql.query(`DROP TYPE IF EXISTS "UserRole" CASCADE`);
      await sql.query(`DROP TYPE IF EXISTS "OrderStatus" CASCADE`);
      
      console.log('✅ All tables and types dropped successfully!');
      
    } catch (error) {
      console.error('❌ Error dropping tables:', error.message);
      throw error;
    }
    
    // Create blog-only schema
    console.log('\n🏗️  Creating blog-only schema...');

    try {
      // Professional Blog Posts Table - Complete WordPress + Strapi inspired schema
      await sql`
        CREATE TABLE blog_posts (
          -- Primary identification
          id SERIAL PRIMARY KEY,
          uuid UUID DEFAULT gen_random_uuid() UNIQUE,

          -- Core content fields (WordPress inspired)
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,

          -- Content status and workflow (WordPress post_status)
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'private', 'trash')),

          -- Featured content
          featured_image_url TEXT,
          featured_image_alt TEXT,
          featured_image_caption TEXT,
          gallery_images JSONB DEFAULT '[]',

          -- Author information (enhanced)
          author_id VARCHAR(255), -- Firebase user ID
          author_name VARCHAR(255),
          author_email VARCHAR(255),
          author_bio TEXT,
          author_avatar_url TEXT,
          author_social_links JSONB DEFAULT '{}',

          -- Content organization (Strapi inspired)
          categories JSONB DEFAULT '[]',
          tags JSONB DEFAULT '[]',

          -- Restaurant integration (Tap2Go specific)
          related_restaurants JSONB DEFAULT '[]',
          featured_restaurant_id VARCHAR(255), -- Single featured restaurant

          -- Content metadata
          reading_time INTEGER,
          word_count INTEGER,
          language VARCHAR(10) DEFAULT 'en',

          -- Publishing and visibility
          is_featured BOOLEAN DEFAULT false,
          is_sticky BOOLEAN DEFAULT false, -- WordPress sticky posts
          comment_status VARCHAR(20) DEFAULT 'open' CHECK (comment_status IN ('open', 'closed', 'disabled')),
          ping_status VARCHAR(20) DEFAULT 'open' CHECK (ping_status IN ('open', 'closed')),

          -- SEO and metadata (comprehensive)
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords JSONB DEFAULT '[]',
          seo_canonical_url TEXT,
          seo_og_image TEXT,
          seo_og_title VARCHAR(255),
          seo_og_description TEXT,
          seo_twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
          seo_schema_markup JSONB DEFAULT '{}',

          -- Content structure (Strapi blocks inspired)
          content_blocks JSONB DEFAULT '[]', -- For rich content blocks
          table_of_contents JSONB DEFAULT '[]',

          -- Scheduling and automation
          scheduled_at TIMESTAMP,
          published_at TIMESTAMP,

          -- Content versioning
          version INTEGER DEFAULT 1,
          parent_id INTEGER REFERENCES blog_posts(id),

          -- Performance and analytics
          view_count INTEGER DEFAULT 0,
          like_count INTEGER DEFAULT 0,
          share_count INTEGER DEFAULT 0,

          -- Content settings
          allow_comments BOOLEAN DEFAULT true,
          allow_pingbacks BOOLEAN DEFAULT true,
          password_protected BOOLEAN DEFAULT false,
          content_password VARCHAR(255),

          -- Timestamps (WordPress style)
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP, -- Soft delete

          -- Content quality
          content_score DECIMAL(3,2), -- SEO/quality score 0-10
          readability_score DECIMAL(3,2), -- Readability score

          -- External integrations
          external_id VARCHAR(255), -- For migrations/integrations
          source_platform VARCHAR(50), -- 'wordpress', 'strapi', 'manual', etc.

          -- Advanced features
          custom_fields JSONB DEFAULT '{}', -- Extensible custom data
          template VARCHAR(100) DEFAULT 'default', -- Template selection

          CONSTRAINT valid_scheduled_date CHECK (scheduled_at IS NULL OR scheduled_at > created_at),
          CONSTRAINT valid_published_date CHECK (published_at IS NULL OR published_at >= created_at)
        )
      `;

      console.log('✅ Blog-only schema created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating CMS schema:', error.message);
      throw error;
    }
    
    // Create comprehensive performance indexes
    console.log('\n📈 Creating professional performance indexes...');
    try {
      // Core identification indexes
      await sql.query(`CREATE INDEX idx_blog_posts_uuid ON blog_posts(uuid)`);
      await sql.query(`CREATE INDEX idx_blog_posts_slug ON blog_posts(slug)`);

      // Status and publishing indexes
      await sql.query(`CREATE INDEX idx_blog_posts_status ON blog_posts(status)`);
      await sql.query(`CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at)`);
      await sql.query(`CREATE INDEX idx_blog_posts_scheduled_at ON blog_posts(scheduled_at)`);

      // Content discovery indexes
      await sql.query(`CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured)`);
      await sql.query(`CREATE INDEX idx_blog_posts_sticky ON blog_posts(is_sticky)`);

      // Author and content indexes
      await sql.query(`CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id)`);
      await sql.query(`CREATE INDEX idx_blog_posts_language ON blog_posts(language)`);

      // JSON field indexes (PostgreSQL GIN)
      await sql.query(`CREATE INDEX idx_blog_posts_categories ON blog_posts USING GIN(categories)`);
      await sql.query(`CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags)`);
      await sql.query(`CREATE INDEX idx_blog_posts_related_restaurants ON blog_posts USING GIN(related_restaurants)`);
      await sql.query(`CREATE INDEX idx_blog_posts_seo_keywords ON blog_posts USING GIN(seo_keywords)`);

      // Performance and analytics indexes
      await sql.query(`CREATE INDEX idx_blog_posts_view_count ON blog_posts(view_count)`);
      await sql.query(`CREATE INDEX idx_blog_posts_content_score ON blog_posts(content_score)`);

      // Composite indexes for common queries
      await sql.query(`CREATE INDEX idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC)`);
      await sql.query(`CREATE INDEX idx_blog_posts_featured_published ON blog_posts(is_featured, status, published_at DESC)`);
      await sql.query(`CREATE INDEX idx_blog_posts_author_status ON blog_posts(author_id, status, published_at DESC)`);

      // Full-text search index
      await sql.query(`CREATE INDEX idx_blog_posts_search ON blog_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content))`);

      // Soft delete index
      await sql.query(`CREATE INDEX idx_blog_posts_deleted_at ON blog_posts(deleted_at) WHERE deleted_at IS NULL`);

      console.log('✅ Professional blog indexes created successfully!');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist, continuing...');
    }
    
    // Show final state
    console.log('\n📊 Final Database State:');
    const finalTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    finalTables.forEach(table => {
      console.log(`   ✓ ${table.tablename}`);
    });
    
    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📋 What was done:');
    console.log('  ✓ Removed all business logic tables');
    console.log('  ✓ Removed Prisma migration tables');
    console.log('  ✓ Created clean blog-only schema');
    console.log('  ✓ Added blog performance indexes');

    console.log('\n🎯 Architecture Summary:');
    console.log('  🔥 Firestore: All business logic (users, orders, restaurants, etc.)');
    console.log('  🗄️  Neon PostgreSQL: Blog posts only');

    console.log('\n📋 Next Steps:');
    console.log('1. Update Prisma schema to include only blog posts');
    console.log('2. Test blog integration with clean database');
    console.log('3. Create blog post management interface');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Cleanup interrupted');
  rl.close();
  process.exit(0);
});

// Run the cleanup
cleanNeonDatabase();

/**
 * Clean Neon Database - Remove All Tables and Start Fresh
 * This script removes all business logic tables that should only be in Firestore
 * and prepares the database for CMS-only content
 */

const { neonClient } = require('../src/lib/neon/client.ts');
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
 * Drop all tables and schemas completely
 */
async function dropAllTables() {
  console.log('\n🗑️  Dropping all tables and schemas...');
  
  try {
    // Get all table names first
    const tables = await neonClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log(`Found ${tables.length} tables to drop:`, tables.map(t => t.tablename));
    
    // Drop all tables with CASCADE to handle foreign keys
    if (tables.length > 0) {
      const tableNames = tables.map(t => `"${t.tablename}"`).join(', ');
      await neonClient.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE`);
    }
    
    // Drop all custom types/enums
    await neonClient.query(`
      DROP TYPE IF EXISTS "UserRole" CASCADE;
      DROP TYPE IF EXISTS "OrderStatus" CASCADE;
    `);
    
    // Drop all sequences
    const sequences = await neonClient.query(`
      SELECT sequencename 
      FROM pg_sequences 
      WHERE schemaname = 'public'
    `);
    
    if (sequences.length > 0) {
      for (const seq of sequences) {
        await neonClient.query(`DROP SEQUENCE IF EXISTS "${seq.sequencename}" CASCADE`);
      }
    }
    
    console.log('✅ All tables, types, and sequences dropped successfully!');
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
}

/**
 * Create CMS-only schema
 */
async function createCMSSchema() {
  console.log('\n🏗️  Creating CMS-only schema...');
  
  try {
    const schemas = [
      // Restaurant content table (CMS extension of Firestore restaurants)
      `
        CREATE TABLE restaurant_contents (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          story TEXT,
          long_description TEXT,
          hero_image_url TEXT,
          gallery_images JSONB DEFAULT '[]',
          awards JSONB DEFAULT '[]',
          certifications JSONB DEFAULT '[]',
          special_features JSONB DEFAULT '[]',
          social_media JSONB DEFAULT '{}',
          seo_data JSONB DEFAULT '{}',
          is_published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Enhanced menu items (CMS extension of Firestore menu items)
      `
        CREATE TABLE menu_item_contents (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE NOT NULL,
          restaurant_firebase_id VARCHAR(255) NOT NULL,
          detailed_description TEXT,
          preparation_story TEXT,
          chef_notes TEXT,
          ingredient_story TEXT,
          images JSONB DEFAULT '[]',
          nutritional_details JSONB DEFAULT '{}',
          preparation_steps JSONB DEFAULT '[]',
          pairing_suggestions TEXT,
          allergen_details JSONB DEFAULT '{}',
          sustainability_info TEXT,
          origin_story TEXT,
          seasonal_availability TEXT,
          seo_data JSONB DEFAULT '{}',
          is_published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Blog posts table
      `
        CREATE TABLE blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          featured_image_url TEXT,
          author_name VARCHAR(255),
          author_bio TEXT,
          author_avatar_url TEXT,
          categories JSONB DEFAULT '[]',
          tags JSONB DEFAULT '[]',
          related_restaurants JSONB DEFAULT '[]',
          reading_time INTEGER,
          is_published BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          seo_data JSONB DEFAULT '{}',
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Marketing promotions content
      `
        CREATE TABLE promotion_contents (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          long_description TEXT,
          terms_and_conditions TEXT,
          banner_image_url TEXT,
          gallery_images JSONB DEFAULT '[]',
          target_audience JSONB DEFAULT '{}',
          marketing_copy TEXT,
          social_media_content JSONB DEFAULT '{}',
          email_content TEXT,
          sms_content TEXT,
          push_notification_content TEXT,
          seo_data JSONB DEFAULT '{}',
          is_published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Static pages table
      `
        CREATE TABLE static_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          page_type VARCHAR(100) DEFAULT 'general',
          meta_title VARCHAR(255),
          meta_description TEXT,
          featured_image_url TEXT,
          is_published BOOLEAN DEFAULT false,
          show_in_navigation BOOLEAN DEFAULT false,
          navigation_order INTEGER,
          seo_data JSONB DEFAULT '{}',
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    ];

    // Execute each schema creation
    for (const schema of schemas) {
      await neonClient.query(schema);
    }
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX idx_restaurant_contents_firebase_id ON restaurant_contents(firebase_id)',
      'CREATE INDEX idx_restaurant_contents_slug ON restaurant_contents(slug)',
      'CREATE INDEX idx_restaurant_contents_published ON restaurant_contents(is_published)',
      'CREATE INDEX idx_menu_item_contents_firebase_id ON menu_item_contents(firebase_id)',
      'CREATE INDEX idx_menu_item_contents_restaurant ON menu_item_contents(restaurant_firebase_id)',
      'CREATE INDEX idx_blog_posts_slug ON blog_posts(slug)',
      'CREATE INDEX idx_blog_posts_published ON blog_posts(is_published)',
      'CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured)',
      'CREATE INDEX idx_promotion_contents_slug ON promotion_contents(slug)',
      'CREATE INDEX idx_promotion_contents_published ON promotion_contents(is_published)',
      'CREATE INDEX idx_static_pages_slug ON static_pages(slug)',
      'CREATE INDEX idx_static_pages_published ON static_pages(is_published)'
    ];

    for (const index of indexes) {
      await neonClient.query(index);
    }

    console.log('✅ CMS-only schema created successfully!');

  } catch (error) {
    console.error('❌ Error creating CMS schema:', error.message);
    throw error;
  }
}

/**
 * Show database information
 */
async function showDatabaseInfo() {
  try {
    const tables = await neonClient.query(`
      SELECT tablename, schemaname
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('\n📊 Current Database Tables:');
    if (tables.length === 0) {
      console.log('   No tables found (clean database)');
    } else {
      tables.forEach(table => {
        console.log(`   ✓ ${table.tablename}`);
      });
    }

    // Show database size
    const sizeResult = await neonClient.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    console.log(`\n💾 Database Size: ${sizeResult[0].size}`);

  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
  }
}

/**
 * Main cleanup function
 */
async function cleanNeonDatabase() {
  try {
    console.log('🧹 Tap2Go Neon Database Cleanup\n');
    console.log('This will remove ALL business logic tables and keep only CMS content tables.');
    console.log('Business data should remain in Firestore only.\n');

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      console.log('Please add your Neon database URL to .env.local');
      process.exit(1);
    }

    // Test connection
    console.log('🔌 Testing database connection...');
    const connected = await neonClient.testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your DATABASE_URL.');
      process.exit(1);
    }
    console.log('✅ Database connection successful!');

    // Show current state
    await showDatabaseInfo();

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
      return;
    }

    // Perform cleanup
    await dropAllTables();
    await createCMSSchema();

    // Show final state
    await showDatabaseInfo();

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📋 What was done:');
    console.log('  ✓ Removed all business logic tables');
    console.log('  ✓ Removed Prisma migration tables');
    console.log('  ✓ Created clean CMS-only schema');
    console.log('  ✓ Added performance indexes');

    console.log('\n🎯 Architecture Summary:');
    console.log('  🔥 Firestore: All business logic (users, orders, restaurants, etc.)');
    console.log('  🗄️  Neon PostgreSQL: CMS content only (blog posts, extended content)');

    console.log('\n📋 Next Steps:');
    console.log('1. Update Prisma schema to remove business tables');
    console.log('2. Test CMS integration with clean database');
    console.log('3. Verify Firestore continues to handle all business operations');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await neonClient.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n👋 Cleanup interrupted');
  rl.close();
  await neonClient.close();
  process.exit(0);
});

// Run the cleanup
cleanNeonDatabase();

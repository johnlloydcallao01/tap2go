#!/usr/bin/env node

/**
 * Neon Database Setup Script for Tap2Go
 * Sets up PostgreSQL database schema and initial data
 */

const { neonClient } = require('../src/lib/neon/client.ts');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to test database connection
async function testConnection() {
  console.log('🔍 Testing Neon database connection...');
  
  try {
    const isConnected = await neonClient.testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
      return true;
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Function to display database information
async function showDatabaseInfo() {
  console.log('\n📊 Database Information:');
  
  try {
    const info = await neonClient.getDatabaseInfo();
    
    if (info.error) {
      console.log('❌ Error getting database info:', info.error);
      return;
    }
    
    console.log(`📍 Connection: ${info.connectionString}`);
    console.log(`🗄️  Database Size: ${info.size}`);
    console.log(`📊 PostgreSQL Version: ${info.version}`);
    console.log(`📋 Tables (${info.tables.length}):`);
    
    if (info.tables.length > 0) {
      info.tables.forEach(table => {
        console.log(`   - ${table.name} (${table.type})`);
      });
    } else {
      console.log('   No tables found');
    }
    
  } catch (error) {
    console.error('❌ Error getting database info:', error.message);
  }
}

// Function to create CMS schema
async function createSchema() {
  console.log('\n🏗️  Creating CMS database schema...');
  
  try {
    await neonClient.createCMSSchema();
    console.log('✅ CMS schema created successfully!');
    
    // Show updated database info
    await showDatabaseInfo();
    
  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    throw error;
  }
}

// Function to drop ALL tables (clean slate)
async function dropAllTables() {
  console.log('\n⚠️  WARNING: This will delete ALL tables including business logic tables!');
  console.log('This will create a clean CMS-only database.');
  const confirm = await prompt('Are you sure you want to proceed? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Clean slate cancelled.');
    return;
  }

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

    console.log('✅ All tables and types dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
}

// Function to drop CMS schema (for development)
async function dropSchema() {
  console.log('\n⚠️  WARNING: This will delete all CMS data!');
  const confirm = await prompt('Are you sure you want to drop the CMS schema? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes') {
    console.log('Schema drop cancelled.');
    return;
  }

  try {
    await neonClient.dropCMSSchema();
    console.log('✅ CMS schema dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping schema:', error.message);
    throw error;
  }
}

// Function to insert sample data
async function insertSampleData() {
  console.log('\n📝 Inserting sample CMS data...');
  
  try {
    const { RestaurantContentOps, BlogPostOps, PromotionOps } = require('../src/lib/neon/operations.ts');
    
    // Sample restaurant content
    const sampleRestaurant = await RestaurantContentOps.create({
      firebase_id: 'sample-restaurant-1',
      slug: 'sample-restaurant',
      story: 'A sample restaurant for testing the CMS integration.',
      long_description: 'This is a detailed description of our sample restaurant, showcasing the rich content capabilities of our CMS system.',
      hero_image_url: 'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/restaurant-hero.jpg',
      gallery_images: [
        'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/restaurant-1.jpg',
        'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/restaurant-2.jpg'
      ],
      awards: [
        { title: 'Best New Restaurant 2024', organization: 'Food & Wine Magazine' }
      ],
      special_features: [
        { name: 'Outdoor Seating', description: 'Beautiful patio dining' },
        { name: 'Live Music', description: 'Every Friday and Saturday' }
      ],
      social_media: {
        facebook: 'https://facebook.com/samplerestaurant',
        instagram: 'https://instagram.com/samplerestaurant'
      },
      seo_data: {
        metaTitle: 'Sample Restaurant - Best Food in Town',
        metaDescription: 'Experience amazing cuisine at Sample Restaurant with fresh ingredients and exceptional service.'
      },
      is_published: true,
      published_at: new Date()
    });
    
    console.log('✅ Sample restaurant content created:', sampleRestaurant.slug);
    
    // Sample blog post
    const sampleBlog = await BlogPostOps.create({
      title: 'Welcome to Tap2Go CMS',
      slug: 'welcome-to-tap2go-cms',
      content: `
        <h2>Welcome to the new Tap2Go Content Management System!</h2>
        <p>We're excited to introduce our new CMS powered by Strapi and Neon PostgreSQL. This system allows us to create rich, engaging content for our food delivery platform.</p>
        
        <h3>Features:</h3>
        <ul>
          <li>Restaurant content management</li>
          <li>Menu item descriptions and images</li>
          <li>Blog posts and articles</li>
          <li>Promotional campaigns</li>
          <li>SEO optimization</li>
        </ul>
        
        <p>Stay tuned for more exciting content!</p>
      `,
      excerpt: 'Introducing the new Tap2Go CMS with rich content management capabilities.',
      featured_image_url: 'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/blog-welcome.jpg',
      author_name: 'Tap2Go Team',
      author_bio: 'The team behind Tap2Go food delivery platform.',
      categories: ['Announcements', 'Technology'],
      tags: ['CMS', 'Strapi', 'Neon', 'PostgreSQL'],
      reading_time: 3,
      is_published: true,
      is_featured: true,
      seo_data: {
        metaTitle: 'Welcome to Tap2Go CMS - Latest Updates',
        metaDescription: 'Learn about the new content management system powering Tap2Go food delivery platform.'
      },
      published_at: new Date()
    });
    
    console.log('✅ Sample blog post created:', sampleBlog.slug);
    
    // Sample promotion
    const samplePromotion = await PromotionOps.create({
      title: '20% Off First Order',
      description: 'Get 20% off your first order when you sign up for Tap2Go! Valid for new customers only.',
      short_description: '20% off for new customers',
      image_url: 'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/promo-20-off.jpg',
      banner_image_url: 'https://res.cloudinary.com/dpekh75yi/image/upload/v1/sample/promo-banner.jpg',
      promotion_type: 'discount',
      discount_type: 'percentage',
      discount_value: 20,
      minimum_order_value: 25,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      is_active: true,
      target_restaurants: [],
      promo_code: 'WELCOME20',
      terms: 'Valid for new customers only. Minimum order $25. Cannot be combined with other offers.',
      seo_data: {
        metaTitle: '20% Off First Order - Tap2Go Promotion',
        metaDescription: 'Save 20% on your first Tap2Go order. Sign up today and enjoy delicious food delivered to your door.'
      }
    });
    
    console.log('✅ Sample promotion created:', samplePromotion.title);
    
    console.log('\n🎉 Sample data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

// Main setup function
async function setupNeonDatabase() {
  try {
    console.log('🚀 Tap2Go Neon Database Setup\n');
    
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      console.log('Please add your Neon database URL to .env.local:');
      console.log('DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/tap2go_cms');
      process.exit(1);
    }
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your DATABASE_URL.');
      process.exit(1);
    }
    
    // Show current database info
    await showDatabaseInfo();
    
    // Ask user what to do
    console.log('\n📋 What would you like to do?');
    console.log('1. Create CMS schema (recommended for first setup)');
    console.log('2. Drop and recreate CMS schema (development only)');
    console.log('3. CLEAN SLATE: Drop ALL tables and create CMS-only database');
    console.log('4. Insert sample data');
    console.log('5. Show database info only');
    console.log('6. Exit');
    
    const choice = await prompt('\nEnter your choice (1-6): ');

    switch (choice) {
      case '1':
        await createSchema();

        const addSample = await prompt('\nWould you like to add sample data? (y/n): ');
        if (addSample.toLowerCase() === 'y') {
          await insertSampleData();
        }
        break;

      case '2':
        await dropSchema();
        await createSchema();

        const addSample2 = await prompt('\nWould you like to add sample data? (y/n): ');
        if (addSample2.toLowerCase() === 'y') {
          await insertSampleData();
        }
        break;

      case '3':
        console.log('\n🎯 CLEAN SLATE MODE: Creating CMS-only database');
        console.log('This will remove all business logic tables and create a clean CMS database.');
        console.log('Business data should remain in Firestore only.');

        await dropAllTables();
        await createSchema();

        const addSample3 = await prompt('\nWould you like to add sample data? (y/n): ');
        if (addSample3.toLowerCase() === 'y') {
          await insertSampleData();
        }

        console.log('\n🎯 Architecture Summary:');
        console.log('  🔥 Firestore: All business logic (users, orders, restaurants, etc.)');
        console.log('  🗄️  Neon PostgreSQL: CMS content only (blog posts, extended content)');
        break;

      case '4':
        await insertSampleData();
        break;

      case '5':
        // Already shown above
        break;

      case '6':
        console.log('Goodbye!');
        break;

      default:
        console.log('Invalid choice');
    }
    
    console.log('\n✅ Setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Test the CMS integration in your application');
    console.log('3. Create content through the admin panel');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await neonClient.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n👋 Setup interrupted');
  rl.close();
  await neonClient.close();
  process.exit(0);
});

// Run the setup
setupNeonDatabase();

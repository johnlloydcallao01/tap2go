/**
 * Verify Clean Neon Setup
 * Check that we have a clean CMS-only database
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');

async function verifySetup() {
  try {
    console.log('🔍 Verifying Clean Neon Setup\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      process.exit(1);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test connection
    console.log('🔌 Testing connection...');
    await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    
    // Check tables
    console.log('\n📊 Checking database tables...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log(`Found ${tables.length} tables:`);
    
    const expectedTables = [
      'blog_posts'
    ];
    
    const actualTables = tables.map(t => t.tablename);
    
    // Check if we have the expected CMS tables
    let allGood = true;
    for (const expectedTable of expectedTables) {
      if (actualTables.includes(expectedTable)) {
        console.log(`   ✅ ${expectedTable}`);
      } else {
        console.log(`   ❌ ${expectedTable} (MISSING)`);
        allGood = false;
      }
    }
    
    // Check for any business logic tables that shouldn't be there
    const businessTables = actualTables.filter(table => 
      table.startsWith('tap2go_') || 
      table === '_prisma_migrations'
    );
    
    if (businessTables.length > 0) {
      console.log('\n⚠️  Found business logic tables (should be removed):');
      businessTables.forEach(table => {
        console.log(`   ❌ ${table}`);
        allGood = false;
      });
    }
    
    // Check database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    console.log(`\n💾 Database Size: ${sizeResult[0].size}`);
    
    // Final verdict
    if (allGood) {
      console.log('\n🎉 SUCCESS: Clean blog-only database setup verified!');
      console.log('\n🎯 Architecture Status:');
      console.log('  🔥 Firestore: Handles all business logic');
      console.log('  🗄️  Neon PostgreSQL: Blog posts only');
      console.log('\n✅ Ready for blog operations!');
    } else {
      console.log('\n❌ ISSUES FOUND: Database setup needs attention');
      console.log('Run the cleanup script again if needed: npm run neon:clean');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifySetup();

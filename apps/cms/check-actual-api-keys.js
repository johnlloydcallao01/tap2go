import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkActualAPIKeys() {
  console.log('🔍 CHECKING ACTUAL API KEYS IN DATABASE');
  console.log('=' .repeat(50));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all users with API keys enabled
    const result = await client.query(`
      SELECT 
        id,
        email,
        role,
        "enable_a_p_i_key",
        "api_key",
        "api_key_index",
        LENGTH("api_key") as api_key_length
      FROM users 
      WHERE "enable_a_p_i_key" = true
      ORDER BY role, email
    `);

    console.log(`\n📊 Found ${result.rows.length} users with API keys enabled:\n`);

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()}: ${user.email}`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - API Key Enabled: ${user.enable_a_p_i_key}`);
      console.log(`   - API Key Length: ${user.api_key_length || 'NULL'}`);
      console.log(`   - API Key Index: ${user.api_key_index ? 'PRESENT' : 'NULL'}`);
      
      if (user.api_key) {
        // Show first 50 characters of encrypted key
        const keyPreview = user.api_key.substring(0, 50) + '...';
        console.log(`   - API Key Preview: ${keyPreview}`);
        
        // Check if it's in PayloadCMS encrypted format (iv:encrypted_data)
        if (user.api_key.includes(':')) {
          const parts = user.api_key.split(':');
          console.log(`   - Format: PayloadCMS encrypted (${parts.length} parts)`);
          console.log(`   - IV Length: ${parts[0] ? parts[0].length : 0}`);
          console.log(`   - Encrypted Data Length: ${parts[1] ? parts[1].length : 0}`);
        } else {
          console.log(`   - Format: Plain text or other`);
        }
      } else {
        console.log(`   - API Key: NULL`);
      }
      console.log('');
    });

    // Check for the specific API key from PayloadCMS dashboard
    const dashboardApiKey = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';
    console.log(`\n🔍 Searching for PayloadCMS dashboard API key: ${dashboardApiKey}`);
    
    const dashboardKeyResult = await client.query(`
      SELECT id, email, role, "api_key"
      FROM users 
      WHERE "api_key" = $1
    `, [dashboardApiKey]);
    
    if (dashboardKeyResult.rows.length > 0) {
      console.log('✅ PayloadCMS dashboard API key found in database:');
      dashboardKeyResult.rows.forEach(user => {
        console.log(`   - ${user.role}: ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('❌ PayloadCMS dashboard API key NOT found in database');
      
      // Check if PayloadCMS might be using a different storage mechanism
      console.log('\n🔍 Checking PayloadCMS API key storage patterns...');
      
      // Check if there's a relationship between the UUID and the encrypted key
      console.log('📋 Analyzing key formats:');
      console.log(`   Dashboard key: ${dashboardApiKey} (UUID format, 36 chars)`);
      console.log(`   Database key:  c9dfaddf1259b4e887b38f9ea0848687... (encrypted, 104 chars)`);
      
      // Check if the UUID might be stored in a different field or table
      const uuidSearchResult = await client.query(`
        SELECT 
          id, 
          email, 
          "api_key", 
          "api_key_index",
          role
        FROM users 
        WHERE "api_key_index" LIKE '%${dashboardApiKey.substring(0, 8)}%' 
           OR "api_key_index" LIKE '%${dashboardApiKey.substring(9, 13)}%'
      `);
      
      if (uuidSearchResult.rows.length > 0) {
        console.log('🔍 Found potential UUID patterns in api_key_index:');
        uuidSearchResult.rows.forEach(user => {
          console.log(`   User: ${user.email}`);
          console.log(`   API Key Index: ${user.api_key_index}`);
        });
      } else {
        console.log('❌ No UUID patterns found in api_key_index field');
      }
    }
    
    // Show all API keys for comparison
    console.log('\n📋 All API keys in database:');
    const allKeysResult = await client.query(`
      SELECT email, "api_key", role, "enable_a_p_i_key"
      FROM users 
      WHERE "api_key" IS NOT NULL
      ORDER BY email
    `);
    
    allKeysResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}): ${user.api_key} (enabled: ${user.enable_a_p_i_key})`);
    });

    // Show recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(30));
    
    if (result.rows.length === 0) {
      console.log('❌ No users have API keys enabled!');
      console.log('   1. Enable API keys for admin/service users in PayloadCMS admin');
      console.log('   2. Generate new API keys through the admin interface');
    } else {
      const hasEncryptedKeys = result.rows.some(user => user.api_key && user.api_key.includes(':'));
      const hasPlainKeys = result.rows.some(user => user.api_key && !user.api_key.includes(':'));
      
      if (hasEncryptedKeys && !hasPlainKeys) {
        console.log('✅ All API keys are properly encrypted');
        console.log('   - Use the encrypted keys for API authentication');
        console.log('   - The plain text keys in test scripts won\'t work');
      } else if (hasPlainKeys) {
        console.log('⚠️  Some API keys are in plain text format');
        console.log('   - This might indicate a configuration issue');
        console.log('   - Consider regenerating API keys through PayloadCMS admin');
      }
      
      console.log('\n📋 Next steps:');
      console.log('1. If web app API key not found, the issue is with API key validation logic');
      console.log('2. Check the custom endpoint authentication implementation');
      console.log('3. Verify API key validation against PayloadCMS user authentication');
      console.log('4. Test with the actual encrypted keys from the database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkActualAPIKeys().catch(console.error);
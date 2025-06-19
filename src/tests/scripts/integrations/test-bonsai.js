// Simple test script to verify Bonsai OpenSearch connection
// Run with: node test-bonsai.js

require('dotenv').config({ path: '.env.local' });
const { Client } = require('@opensearch-project/opensearch');

console.log('🔍 Testing Bonsai OpenSearch Connection...');
console.log('Environment variables:');
console.log('BONSAI_HOST:', process.env.BONSAI_HOST ? '✅ Set' : '❌ Missing');
console.log('BONSAI_USERNAME:', process.env.BONSAI_USERNAME ? '✅ Set' : '❌ Missing');
console.log('BONSAI_PASSWORD:', process.env.BONSAI_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('BONSAI_URL:', process.env.BONSAI_URL ? '✅ Set' : '❌ Missing');

// Create client
const client = new Client({
  node: process.env.BONSAI_HOST,
  auth: {
    username: process.env.BONSAI_USERNAME,
    password: process.env.BONSAI_PASSWORD
  },
  ssl: {
    rejectUnauthorized: true
  }
});

async function testConnection() {
  try {
    console.log('\n🔗 Testing connection...');
    const pingResponse = await client.ping();
    console.log('✅ Ping successful!');
    
    console.log('\n📊 Getting cluster info...');
    const info = await client.info();
    console.log('✅ Cluster info:', {
      name: info.body.cluster_name,
      version: info.body.version.number,
      lucene_version: info.body.version.lucene_version
    });
    
    console.log('\n🎉 Bonsai OpenSearch connection test PASSED!');
    console.log('You can now use OpenSearch (Elasticsearch-compatible) search in your Tap2Go app.');
    
  } catch (error) {
    console.error('\n❌ Connection test FAILED:');
    console.error('Error:', error.message);
    
    if (error.meta) {
      console.error('Status:', error.meta.statusCode);
      console.error('Body:', error.meta.body);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env.local file has correct Bonsai credentials');
    console.log('2. Verify your Bonsai cluster is running in the dashboard');
    console.log('3. Check your internet connection');
  }
}

testConnection();

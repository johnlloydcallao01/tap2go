/**
 * Simple test script to verify media API integration
 * Run with: node test-media-api.js
 */

const CMS_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = `${CMS_BASE_URL}/api`;

async function testMediaAPI() {
  console.log('🧪 Testing Media API Integration...\n');

  try {
    // Test 1: Check if CMS server is running
    console.log('1. Testing CMS server connection...');
    const healthResponse = await fetch(CMS_BASE_URL);
    if (healthResponse.ok) {
      console.log('✅ CMS server is running');
    } else {
      console.log('❌ CMS server is not responding');
      return;
    }

    // Test 2: Test media API endpoint
    console.log('\n2. Testing media API endpoint...');
    const mediaResponse = await fetch(`${API_BASE_URL}/media`);
    
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      console.log('✅ Media API is accessible');
      console.log(`📊 Found ${mediaData.totalDocs || 0} media files`);
      
      if (mediaData.docs && mediaData.docs.length > 0) {
        console.log('📁 Sample media file:');
        const sampleFile = mediaData.docs[0];
        console.log(`   - ID: ${sampleFile.id}`);
        console.log(`   - Filename: ${sampleFile.filename}`);
        console.log(`   - Type: ${sampleFile.mimeType}`);
        console.log(`   - URL: ${sampleFile.url}`);
      }
    } else {
      console.log('❌ Media API is not accessible');
      console.log(`   Status: ${mediaResponse.status}`);
      console.log(`   Error: ${await mediaResponse.text()}`);
    }

    // Test 3: Test Cloudinary integration
    console.log('\n3. Testing Cloudinary integration...');
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.log('✅ Cloudinary cloud name is configured');
      console.log(`   Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
    } else {
      console.log('⚠️  Cloudinary cloud name not found in environment');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMediaAPI();

/**
 * Test script for production posts API
 * Run this to test the /api/blog/posts endpoint in production
 */

const PRODUCTION_URL = 'https://your-app.vercel.app'; // Replace with your actual Vercel URL

async function testPostsAPI() {
  console.log('🧪 Testing Production Posts API...');
  console.log('🌍 Target URL:', PRODUCTION_URL);
  
  try {
    // Test 1: Debug endpoint
    console.log('\n📊 Test 1: Debug endpoint');
    const debugResponse = await fetch(`${PRODUCTION_URL}/api/debug/posts`);
    const debugData = await debugResponse.json();
    
    console.log('Debug Response Status:', debugResponse.status);
    console.log('Debug Response:', JSON.stringify(debugData, null, 2));
    
    // Test 2: Main posts endpoint
    console.log('\n📊 Test 2: Main posts endpoint');
    const postsResponse = await fetch(`${PRODUCTION_URL}/api/blog/posts`);
    const postsData = await postsResponse.json();
    
    console.log('Posts Response Status:', postsResponse.status);
    console.log('Posts Response:', JSON.stringify(postsData, null, 2));
    
    // Test 3: Posts with status filter
    console.log('\n📊 Test 3: Posts with status filter (published)');
    const publishedResponse = await fetch(`${PRODUCTION_URL}/api/blog/posts?status=published`);
    const publishedData = await publishedResponse.json();
    
    console.log('Published Posts Response Status:', publishedResponse.status);
    console.log('Published Posts Response:', JSON.stringify(publishedData, null, 2));
    
    // Test 4: Posts with status filter (draft)
    console.log('\n📊 Test 4: Posts with status filter (draft)');
    const draftResponse = await fetch(`${PRODUCTION_URL}/api/blog/posts?status=draft`);
    const draftData = await draftResponse.json();
    
    console.log('Draft Posts Response Status:', draftResponse.status);
    console.log('Draft Posts Response:', JSON.stringify(draftData, null, 2));
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('- Debug endpoint:', debugResponse.ok ? '✅ OK' : '❌ Failed');
    console.log('- Main posts endpoint:', postsResponse.ok ? '✅ OK' : '❌ Failed');
    console.log('- Published filter:', publishedResponse.ok ? '✅ OK' : '❌ Failed');
    console.log('- Draft filter:', draftResponse.ok ? '✅ OK' : '❌ Failed');
    
    if (postsData.success) {
      console.log(`- Total posts found: ${postsData.posts?.length || 0}`);
      console.log(`- Stats: ${JSON.stringify(postsData.stats)}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions for running this script
console.log(`
🚀 Production Posts API Test Script

To run this script:
1. Replace PRODUCTION_URL with your actual Vercel deployment URL
2. Run: node scripts/test-production-posts-api.js

This will test:
- Debug endpoint for detailed diagnostics
- Main posts API endpoint
- Status filtering functionality
- Response format and data structure
`);

// Uncomment the line below to run the test
// testPostsAPI();

module.exports = { testPostsAPI };

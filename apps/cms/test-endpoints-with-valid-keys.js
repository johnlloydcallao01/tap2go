import fetch from 'node-fetch';

/**
 * Test Geospatial Endpoints with Valid API Keys
 * This script tests all three geospatial endpoints with known valid API keys
 */

const BASE_URL = 'https://cms.tap2goph.com/api';

// Known valid API keys from test-api-key-auth.js
const ADMIN_API_KEY = '5c4a6003319c5c34cbe294bbf80ca501';
const SERVICE_API_KEY = '13486c38-c99b-489a-bac0-8977d6c2d710';

// Test coordinates (generic test location)
const testLat = 14.0000;
const testLng = 121.0000;
const testRadius = 10000; // 10km in meters

async function testEndpointWithKey(endpoint, apiKey, keyType, params = {}) {
  console.log(`\n🔍 Testing ${endpoint} with ${keyType} API Key`);
  console.log('=' .repeat(60));
  
  const queryParams = new URLSearchParams({
    latitude: testLat.toString(),
    longitude: testLng.toString(),
    limit: '10',
    offset: '0',
    ...params
  });
  
  if (endpoint === '/merchants-by-location') {
    queryParams.set('radius', testRadius.toString());
  }
  
  const url = `${BASE_URL}${endpoint}?${queryParams}`;
  console.log(`📍 Request URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS!');
      console.log(`   Found merchants: ${data.data?.merchants?.length || data.merchants?.length || 0}`);
      console.log(`   Total count: ${data.data?.totalCount || data.totalCount || data.data?.totalFound || 'N/A'}`);
      console.log(`   Response time: ${data.responseTime || 'N/A'}`);
      console.log(`   Request ID: ${data.requestId || 'N/A'}`);
      
      // Show sample merchant if available
      const merchants = data.data?.merchants || data.merchants || [];
      if (merchants.length > 0) {
        const merchant = merchants[0];
        console.log('   Sample merchant:');
        console.log(`     - Name: ${merchant.outletName || merchant.outlet_name || 'N/A'}`);
        console.log(`     - Distance: ${merchant.distance || merchant.distanceMeters || 'N/A'}m`);
        console.log(`     - Active: ${merchant.isActive || merchant.is_active || 'N/A'}`);
        if (merchant.deliveryRadiusMeters || merchant.delivery_radius_meters) {
          console.log(`     - Delivery radius: ${merchant.deliveryRadiusMeters || merchant.delivery_radius_meters}m`);
        }
      }
    } else {
      console.log('❌ FAILED!');
      console.log(`   Error response: ${responseText}`);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log(`   Error code: ${errorData.code || 'N/A'}`);
        console.log(`   Error message: ${errorData.error || errorData.message || 'N/A'}`);
        console.log(`   Request ID: ${errorData.requestId || 'N/A'}`);
      } catch (e) {
        console.log('   Could not parse error response as JSON');
      }
    }
    
    return response.ok;
    
  } catch (error) {
    console.log('❌ REQUEST ERROR!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testInvalidScenarios() {
  console.log('\n🚨 Testing Invalid Scenarios');
  console.log('=' .repeat(60));
  
  // Test 1: Missing API key
  console.log('\n📋 Test 1: Missing API key');
  try {
    const response = await fetch(`${BASE_URL}/merchants-by-location?latitude=${testLat}&longitude=${testLng}&radius=${testRadius}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 401) {
      console.log('   ✅ Correctly rejected missing API key');
    } else {
      console.log('   ⚠️  Expected 401 status');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Invalid API key
  console.log('\n📋 Test 2: Invalid API key');
  try {
    const response = await fetch(`${BASE_URL}/merchants-by-location?latitude=${testLat}&longitude=${testLng}&radius=${testRadius}`, {
      method: 'GET',
      headers: {
        'Authorization': 'users API-Key invalid-key-12345',
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 403) {
      console.log('   ✅ Correctly rejected invalid API key');
    } else {
      console.log('   ⚠️  Expected 403 status');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Invalid coordinates
  console.log('\n📋 Test 3: Invalid coordinates');
  try {
    const response = await fetch(`${BASE_URL}/merchants-by-location?latitude=invalid&longitude=${testLng}&radius=${testRadius}`, {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 400) {
      console.log('   ✅ Correctly rejected invalid coordinates');
    } else {
      console.log('   ⚠️  Expected 400 status');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Missing required parameters
  console.log('\n📋 Test 4: Missing required parameters');
  try {
    const response = await fetch(`${BASE_URL}/merchants-by-location?latitude=${testLat}`, {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${ADMIN_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    if (response.status === 400) {
      console.log('   ✅ Correctly rejected missing parameters');
    } else {
      console.log('   ⚠️  Expected 400 status');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 COMPREHENSIVE GEOSPATIAL ENDPOINTS TEST');
  console.log('🔑 Testing with known valid API keys');
  console.log('🌍 Testing all three geospatial endpoints');
  console.log('=' .repeat(80));
  
  const endpoints = [
    '/merchants-by-location',
    '/merchants-in-delivery-radius', 
    '/merchants-in-service-area'
  ];
  
  const apiKeys = [
    { key: ADMIN_API_KEY, type: 'ADMIN' },
    { key: SERVICE_API_KEY, type: 'SERVICE' }
  ];
  
  let successCount = 0;
  let totalTests = 0;
  
  // Test each endpoint with each API key
  for (const endpoint of endpoints) {
    for (const { key, type } of apiKeys) {
      totalTests++;
      const success = await testEndpointWithKey(endpoint, key, type);
      if (success) successCount++;
    }
  }
  
  // Test invalid scenarios
  await testInvalidScenarios();
  
  // Summary
  console.log('\n🎯 TEST SUMMARY');
  console.log('=' .repeat(80));
  console.log(`✅ Successful endpoint tests: ${successCount}/${totalTests}`);
  console.log(`📊 Success rate: ${Math.round((successCount/totalTests) * 100)}%`);
  
  if (successCount === totalTests) {
    console.log('🎉 All endpoint tests passed!');
    console.log('✅ API key validation is working correctly');
    console.log('✅ All three geospatial endpoints are functional');
  } else {
    console.log('⚠️  Some tests failed - check the logs above');
  }
  
  console.log('\n🔍 Next steps:');
  console.log('   - Review any failed tests above');
  console.log('   - Check server logs for detailed error information');
  console.log('   - Verify database connectivity and PostGIS setup');
}

main().catch(console.error);
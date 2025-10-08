import fetch from 'node-fetch';

// API key from PayloadCMS dashboard (UUID format)
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';
const BASE_URL = 'https://cms.tap2goph.com/api';

// Test coordinates (generic test location)
const TEST_COORDINATES = {
  latitude: 14.0000,
  longitude: 121.0000
};

const SEARCH_RADIUS = 5000; // 5km in meters
const LIMIT = 10;
const OFFSET = 0;

async function testEndpoint(endpoint, params, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  console.log(`🔗 URL: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`✅ SUCCESS`);
      if (typeof responseData === 'object' && responseData.merchants) {
        console.log(`📦 Found ${responseData.merchants.length} merchants`);
        console.log(`📄 Total pages: ${responseData.totalPages || 'N/A'}`);
        console.log(`🔢 Total docs: ${responseData.totalDocs || 'N/A'}`);
      } else {
        console.log(`📦 Response:`, JSON.stringify(responseData, null, 2));
      }
    } else {
      console.log(`❌ FAILED`);
      console.log(`📦 Response:`, JSON.stringify(responseData, null, 2));
    }
    
    return { success: response.ok, status: response.status, data: responseData };
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Geospatial Endpoints with Web API Key');
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📍 Test Coordinates: ${TEST_COORDINATES.latitude}, ${TEST_COORDINATES.longitude}`);
  console.log('=' .repeat(80));
  
  const results = [];
  
  // Test 1: /merchants-by-location
  results.push(await testEndpoint('/merchants-by-location', {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude,
    limit: LIMIT,
    offset: OFFSET
  }, 'Get merchants by location'));
  
  // Test 2: /merchants-in-delivery-radius
  results.push(await testEndpoint('/merchants-in-delivery-radius', {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude,
    radius: SEARCH_RADIUS,
    limit: LIMIT,
    offset: OFFSET
  }, 'Get merchants in delivery radius'));
  
  // Test 3: /merchants-in-service-area
  results.push(await testEndpoint('/merchants-in-service-area', {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude,
    limit: LIMIT,
    offset: OFFSET
  }, 'Get merchants in service area'));
  
  // Test 4: Invalid coordinates (should return 400)
  results.push(await testEndpoint('/merchants-by-location', {
    latitude: 'invalid',
    longitude: 'invalid',
    limit: LIMIT,
    offset: OFFSET
  }, 'Test with invalid coordinates (should return 400)'));
  
  // Test 5: Missing coordinates (should return 400)
  results.push(await testEndpoint('/merchants-by-location', {
    limit: LIMIT,
    offset: OFFSET
  }, 'Test with missing coordinates (should return 400)'));
  
  // Summary
  console.log('\n' + '=' .repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful tests: ${successful}/${total}`);
  console.log(`❌ Failed tests: ${total - successful}/${total}`);
  console.log(`📈 Success rate: ${((successful / total) * 100).toFixed(1)}%`);
  
  results.forEach((result, index) => {
    const testNames = [
      'merchants-by-location',
      'merchants-in-delivery-radius', 
      'merchants-in-service-area',
      'invalid coordinates test',
      'missing coordinates test'
    ];
    console.log(`${index + 1}. ${testNames[index]}: ${result.success ? '✅' : '❌'} (${result.status || 'ERROR'})`);
  });
  
  if (successful === 3 && results[3].status === 400 && results[4].status === 400) {
    console.log('\n🎉 All tests passed! API key validation and error handling working correctly.');
  } else if (successful === 3) {
    console.log('\n⚠️  Main endpoints work, but error handling may need attention.');
  } else {
    console.log('\n🚨 Some tests failed. Please check the API key and endpoint configuration.');
  }
}

// Run the tests
runTests().catch(console.error);
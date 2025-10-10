const https = require('https');
const http = require('http');
const { URL } = require('url');

const API_BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';

// Test coordinates (Manila area - close to our existing merchants)
const TEST_COORDINATES = {
  latitude: 14.5872103,
  longitude: 120.9844057,
  radius: 50000 // 50km in meters
};

async function makeAPIRequest(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  console.log(`🔍 Testing: ${url.toString()}`);
  
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `users API-Key ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        console.log(`📦 Raw Response Length: ${data.length} characters`);
        console.log(`📄 Raw Response (first 500 chars):`, data.substring(0, 500));
        
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.log(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
          console.log(`Full Response: ${data}`);
          resolve(null);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ JSON Parse Success`);
          console.log(`🔍 Response Structure:`, Object.keys(jsonData));
          console.log(`📊 Full Response:`, JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (parseError) {
          console.log(`❌ JSON Parse Error: ${parseError.message}`);
          console.log(`Raw response: ${data}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      resolve(null);
    });

    req.end();
  });
}

async function debugEndpoint(endpointName, endpoint, params) {
  console.log(`\n🚀 DEBUGGING ${endpointName.toUpperCase()}`);
  console.log('='.repeat(60));
  
  const result = await makeAPIRequest(endpoint, params);
  
  if (result) {
    console.log(`\n🔍 DETAILED ANALYSIS:`);
    console.log(`Type: ${typeof result}`);
    console.log(`Is Array: ${Array.isArray(result)}`);
    
    if (result.data) {
      console.log(`\n📦 Data Property Found:`);
      console.log(`Data Type: ${typeof result.data}`);
      console.log(`Data Is Array: ${Array.isArray(result.data)}`);
      console.log(`Data Content:`, JSON.stringify(result.data, null, 2));
    }
    
    if (result.merchants) {
      console.log(`\n🏪 Merchants Property Found:`);
      console.log(`Merchants Type: ${typeof result.merchants}`);
      console.log(`Merchants Is Array: ${Array.isArray(result.merchants)}`);
      console.log(`Merchants Content:`, JSON.stringify(result.merchants, null, 2));
    }
    
    // Check for any array properties
    Object.keys(result).forEach(key => {
      if (Array.isArray(result[key])) {
        console.log(`\n📋 Array Property "${key}" found with ${result[key].length} items:`);
        result[key].forEach((item, index) => {
          console.log(`  Item ${index}:`, JSON.stringify(item, null, 2));
        });
      }
    });
  }
  
  return result;
}

async function runDebugTests() {
  console.log('🔍 DEBUGGING API ENDPOINTS - DETAILED RESPONSE ANALYSIS');
  console.log('='.repeat(70));
  console.log(`🌍 Test Location: ${TEST_COORDINATES.latitude}, ${TEST_COORDINATES.longitude}`);
  console.log(`📏 Search Radius: ${TEST_COORDINATES.radius / 1000} km`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  
  // Test each endpoint
  await debugEndpoint(
    'merchants-by-location',
    '/merchants-by-location',
    {
      latitude: TEST_COORDINATES.latitude,
      longitude: TEST_COORDINATES.longitude,
      radius: TEST_COORDINATES.radius
    }
  );
  
  await debugEndpoint(
    'merchants-in-delivery-radius',
    '/merchants-in-delivery-radius',
    {
      latitude: TEST_COORDINATES.latitude,
      longitude: TEST_COORDINATES.longitude
    }
  );
  
  await debugEndpoint(
    'merchants-in-service-area',
    '/merchants-in-service-area',
    {
      latitude: TEST_COORDINATES.latitude,
      longitude: TEST_COORDINATES.longitude
    }
  );
}

// Run the debug tests
runDebugTests().catch(console.error);
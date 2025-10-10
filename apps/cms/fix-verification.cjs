const https = require('https');
const http = require('http');
const { URL } = require('url');

const API_BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';

// Test coordinates (Manila area)
const TEST_COORDINATES = {
  latitude: 14.5872103,
  longitude: 120.9844057,
  radius: 50000 // 50km in meters
};

async function makeAPIRequest(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

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
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.log(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
          resolve(null);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseError) {
          console.log(`❌ JSON Parse Error: ${parseError.message}`);
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

async function testAllEndpoints() {
  console.log('🔍 TESTING API ENDPOINTS WITH PROPER PARSING');
  console.log('='.repeat(60));
  console.log(`🌍 Test Location: ${TEST_COORDINATES.latitude}, ${TEST_COORDINATES.longitude}`);
  console.log(`📏 Search Radius: ${TEST_COORDINATES.radius / 1000} km`);
  
  const endpoints = [
    {
      name: 'merchants-by-location',
      path: '/merchants-by-location',
      params: {
        latitude: TEST_COORDINATES.latitude,
        longitude: TEST_COORDINATES.longitude,
        radius: TEST_COORDINATES.radius
      }
    },
    {
      name: 'merchants-in-delivery-radius',
      path: '/merchants-in-delivery-radius',
      params: {
        latitude: TEST_COORDINATES.latitude,
        longitude: TEST_COORDINATES.longitude
      }
    },
    {
      name: 'merchants-in-service-area',
      path: '/merchants-in-service-area',
      params: {
        latitude: TEST_COORDINATES.latitude,
        longitude: TEST_COORDINATES.longitude
      }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🚀 TESTING: ${endpoint.name.toUpperCase()}`);
    console.log('='.repeat(40));
    
    const response = await makeAPIRequest(endpoint.path, endpoint.params);
    
    if (!response) {
      console.log('❌ No response received');
      continue;
    }
    
    console.log('✅ Response received successfully');
    console.log('📊 Response structure:', Object.keys(response));
    
    // Handle the actual response structure
    let merchants = [];
    if (response.data && Array.isArray(response.data)) {
      merchants = response.data;
    } else if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
      merchants = response.data.docs;
    } else if (response.merchants && Array.isArray(response.merchants)) {
      merchants = response.merchants;
    } else {
      console.log('⚠️  Unexpected response structure');
      console.log('📄 Full response:', JSON.stringify(response, null, 2));
      continue;
    }
    
    console.log(`🏪 Found ${merchants.length} merchants`);
    
    if (merchants.length > 0) {
      console.log('\n📍 MERCHANT COORDINATES:');
      merchants.forEach((merchant, index) => {
        const lat = merchant.merchant_latitude || merchant.latitude || 'N/A';
        const lng = merchant.merchant_longitude || merchant.longitude || 'N/A';
        const id = merchant.id || 'N/A';
        const status = merchant.operational_status || 'N/A';
        const deliveryRadius = merchant.delivery_radius_meters || 'N/A';
        
        console.log(`  ${index + 1}. ID: ${id}`);
        console.log(`     📍 Coordinates: ${lat}, ${lng}`);
        console.log(`     📊 Status: ${status}`);
        console.log(`     🚚 Delivery Radius: ${deliveryRadius} meters`);
        console.log(`     🏃 Distance: ${merchant.distance || 'N/A'} meters`);
      });
    }
    
    // Check coordinate quality
    const validCoordinates = merchants.filter(m => 
      (m.merchant_latitude || m.latitude) && 
      (m.merchant_longitude || m.longitude)
    );
    
    console.log(`\n📊 COORDINATE ANALYSIS:`);
    console.log(`   Total merchants: ${merchants.length}`);
    console.log(`   With coordinates: ${validCoordinates.length}`);
    console.log(`   Coordinate coverage: ${merchants.length > 0 ? ((validCoordinates.length / merchants.length) * 100).toFixed(1) : 0}%`);
  }
}

// Run the test
testAllEndpoints()
  .then(() => {
    console.log('\n✅ API endpoint testing completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
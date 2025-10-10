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
        if (res.statusCode < 200 || res.statusCode >= 300) {
          console.log(`❌ HTTP ${res.statusCode}: ${res.statusMessage}`);
          console.log(`Response: ${data}`);
          resolve(null);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
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

function analyzeCoordinateData(merchants, endpointName) {
  console.log(`\n📊 COORDINATE ANALYSIS FOR ${endpointName.toUpperCase()}:`);
  console.log('='.repeat(60));
  
  if (!merchants || merchants.length === 0) {
    console.log('❌ No merchants returned');
    return;
  }

  console.log(`✅ Found ${merchants.length} merchant(s)`);
  
  merchants.forEach((merchant, index) => {
    console.log(`\n${index + 1}. Merchant ID: ${merchant.id}`);
    console.log(`   🌍 Latitude: ${merchant.merchant_latitude || 'NOT SET'}`);
    console.log(`   🌍 Longitude: ${merchant.merchant_longitude || 'NOT SET'}`);
    console.log(`   🚚 Delivery Radius: ${merchant.delivery_radius_meters ? (merchant.delivery_radius_meters / 1000).toFixed(1) + ' km' : 'NOT SET'}`);
    console.log(`   📊 Status: ${merchant.operational_status || 'NOT SET'}`);
    console.log(`   ✅ Active: ${merchant.is_active ? 'Yes' : 'No'}`);
    console.log(`   📦 Accepting Orders: ${merchant.is_accepting_orders ? 'Yes' : 'No'}`);
    
    // Check coordinate validity
    const hasValidCoords = merchant.merchant_latitude && merchant.merchant_longitude;
    console.log(`   🎯 Coordinates Valid: ${hasValidCoords ? '✅ YES' : '❌ NO'}`);
    
    if (hasValidCoords) {
      // Calculate distance from test point
      const distance = calculateDistance(
        TEST_COORDINATES.latitude,
        TEST_COORDINATES.longitude,
        parseFloat(merchant.merchant_latitude),
        parseFloat(merchant.merchant_longitude)
      );
      console.log(`   📏 Distance from test point: ${distance.toFixed(2)} km`);
    }
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function testMerchantsByLocation() {
  console.log('\n🚀 TESTING /merchants-by-location ENDPOINT');
  console.log('='.repeat(50));
  
  const params = {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude,
    radius: TEST_COORDINATES.radius
  };
  
  const result = await makeAPIRequest('/merchants-by-location', params);
  
  if (result) {
    console.log(`✅ Endpoint responded successfully`);
    console.log(`📦 Response structure:`, Object.keys(result));
    
    const merchants = result.merchants || result.data || result;
    analyzeCoordinateData(Array.isArray(merchants) ? merchants : [merchants], 'merchants-by-location');
  }
  
  return result;
}

async function testMerchantsInDeliveryRadius() {
  console.log('\n🚀 TESTING /merchants-in-delivery-radius ENDPOINT');
  console.log('='.repeat(50));
  
  const params = {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude
  };
  
  const result = await makeAPIRequest('/merchants-in-delivery-radius', params);
  
  if (result) {
    console.log(`✅ Endpoint responded successfully`);
    console.log(`📦 Response structure:`, Object.keys(result));
    
    const merchants = result.merchants || result.data || result;
    analyzeCoordinateData(Array.isArray(merchants) ? merchants : [merchants], 'merchants-in-delivery-radius');
  }
  
  return result;
}

async function testMerchantsInServiceArea() {
  console.log('\n🚀 TESTING /merchants-in-service-area ENDPOINT');
  console.log('='.repeat(50));
  
  const params = {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude
  };
  
  const result = await makeAPIRequest('/merchants-in-service-area', params);
  
  if (result) {
    console.log(`✅ Endpoint responded successfully`);
    console.log(`📦 Response structure:`, Object.keys(result));
    
    const merchants = result.merchants || result.data || result;
    analyzeCoordinateData(Array.isArray(merchants) ? merchants : [merchants], 'merchants-in-service-area');
  }
  
  return result;
}

async function runAllTests() {
  console.log('🧪 TESTING PHASE 2 API ENDPOINTS');
  console.log('='.repeat(60));
  console.log(`🌍 Test Location: ${TEST_COORDINATES.latitude}, ${TEST_COORDINATES.longitude}`);
  console.log(`📏 Search Radius: ${TEST_COORDINATES.radius / 1000} km`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  
  const results = {
    merchantsByLocation: await testMerchantsByLocation(),
    merchantsInDeliveryRadius: await testMerchantsInDeliveryRadius(),
    merchantsInServiceArea: await testMerchantsInServiceArea()
  };
  
  console.log('\n📈 FINAL SUMMARY');
  console.log('='.repeat(40));
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${testName}: ${status}`);
  });
  
  console.log('\n🎯 COORDINATE DATA AVAILABILITY:');
  
  let totalMerchants = 0;
  let merchantsWithCoords = 0;
  
  Object.values(results).forEach(result => {
    if (result) {
      const merchants = result.merchants || result.data || result;
      const merchantArray = Array.isArray(merchants) ? merchants : [merchants];
      
      merchantArray.forEach(merchant => {
        if (merchant && merchant.id) {
          totalMerchants++;
          if (merchant.merchant_latitude && merchant.merchant_longitude) {
            merchantsWithCoords++;
          }
        }
      });
    }
  });
  
  console.log(`Total merchants found: ${totalMerchants}`);
  console.log(`Merchants with coordinates: ${merchantsWithCoords}`);
  console.log(`Coordinate coverage: ${totalMerchants > 0 ? ((merchantsWithCoords / totalMerchants) * 100).toFixed(1) : 0}%`);
}

// Run the tests
runAllTests().catch(console.error);
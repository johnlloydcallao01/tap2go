const https = require('https');
const http = require('http');
const { URL } = require('url');
const { Pool } = require('pg');

const API_BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tap2go',
  password: 'password',
  port: 5432,
});

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
          resolve(null);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseError) {
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      resolve(null);
    });

    req.end();
  });
}

async function getDatabaseMerchants() {
  try {
    const query = `
      SELECT 
        id,
        merchant_latitude,
        merchant_longitude,
        delivery_radius_meters,
        max_delivery_radius_meters,
        operational_status,
        is_active,
        is_accepting_orders,
        created_at
      FROM merchants 
      WHERE merchant_latitude IS NOT NULL 
        AND merchant_longitude IS NOT NULL
      ORDER BY id;
    `;
    
    console.log('🔍 Executing database query...');
    const result = await pool.query(query);
    console.log(`✅ Database query successful: ${result.rows.length} rows returned`);
    return result.rows;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Full error:', error);
    return [];
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function verifyCoordinateAccuracy() {
  console.log('🔍 COORDINATE ACCURACY VERIFICATION');
  console.log('='.repeat(50));
  
  // Get merchants from database
  console.log('\n📊 Fetching merchants from database...');
  const dbMerchants = await getDatabaseMerchants();
  console.log(`Found ${dbMerchants.length} merchants in database`);
  
  // Get merchants from API
  console.log('\n🌐 Fetching merchants from API...');
  const apiResponse = await makeAPIRequest('/merchants-by-location', {
    latitude: TEST_COORDINATES.latitude,
    longitude: TEST_COORDINATES.longitude,
    radius: TEST_COORDINATES.radius
  });
  
  console.log('🔍 API Response received:', apiResponse ? 'Success' : 'Failed');
  if (apiResponse) {
    console.log('📊 API Response keys:', Object.keys(apiResponse));
    console.log('📊 API Response data type:', typeof apiResponse.data);
    console.log('📊 API Response data length:', apiResponse.data ? apiResponse.data.length : 'N/A');
  }
  
  if (!apiResponse || !apiResponse.data) {
    console.log('❌ Failed to get API response or no data property');
    return;
  }
  
  const apiMerchants = apiResponse.data;
  console.log(`Found ${apiMerchants.length} merchants from API`);
  
  console.log('\n🔍 COORDINATE COMPARISON:');
  console.log('='.repeat(50));
  
  let matchCount = 0;
  let totalChecked = 0;
  
  for (const dbMerchant of dbMerchants) {
    const apiMerchant = apiMerchants.find(m => m.id === dbMerchant.id);
    
    if (apiMerchant) {
      totalChecked++;
      
      const dbLat = parseFloat(dbMerchant.merchant_latitude);
      const dbLng = parseFloat(dbMerchant.merchant_longitude);
      const apiLat = parseFloat(apiMerchant.merchant_latitude);
      const apiLng = parseFloat(apiMerchant.merchant_longitude);
      
      const distance = calculateDistance(dbLat, dbLng, apiLat, apiLng);
      const isMatch = distance < 0.001; // Less than 1 meter difference
      
      if (isMatch) matchCount++;
      
      console.log(`\n🏪 Merchant ID: ${dbMerchant.id}`);
      console.log(`   Database: ${dbLat}, ${dbLng}`);
      console.log(`   API:      ${apiLat}, ${apiLng}`);
      console.log(`   Distance: ${(distance * 1000).toFixed(2)} meters`);
      console.log(`   Match:    ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      // Additional API data verification
      console.log(`   Delivery Radius: ${apiMerchant.delivery_radius_meters || 'N/A'} meters`);
      console.log(`   Status: ${apiMerchant.operational_status || 'N/A'}`);
      console.log(`   Active: ${apiMerchant.is_active ? 'Yes' : 'No'}`);
      console.log(`   Distance from search point: ${apiMerchant.distance || 'N/A'} meters`);
    }
  }
  
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log('='.repeat(30));
  console.log(`Total merchants in database: ${dbMerchants.length}`);
  console.log(`Total merchants from API: ${apiMerchants.length}`);
  console.log(`Merchants compared: ${totalChecked}`);
  console.log(`Coordinate matches: ${matchCount}`);
  console.log(`Accuracy rate: ${totalChecked > 0 ? ((matchCount / totalChecked) * 100).toFixed(1) : 0}%`);
  
  if (matchCount === totalChecked && totalChecked > 0) {
    console.log('✅ All coordinates match perfectly!');
  } else if (matchCount > 0) {
    console.log('⚠️  Some coordinate discrepancies found');
  } else {
    console.log('❌ No coordinate matches found');
  }
}

// Run verification
verifyCoordinateAccuracy()
  .then(() => {
    console.log('\n✅ Coordinate verification completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
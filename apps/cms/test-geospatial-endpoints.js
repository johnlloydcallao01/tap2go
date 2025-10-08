import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = process.env.PAYLOAD_SECRET_KEY;

async function testGeospatialEndpoints() {
  console.log('🧪 TESTING GEOSPATIAL ENDPOINTS SYSTEMATICALLY...\n');

  // Test coordinates (generic test location)
  const testLat = 14.0000;
  const testLng = 121.0000;
  const testRadius = 10000; // 10km in meters

  const headers = {
    'Authorization': `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  console.log('🔧 Test Configuration:');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Test Location: ${testLat}, ${testLng}`);
  console.log(`  Search Radius: ${testRadius}m`);
  console.log(`  API Key: ${API_KEY ? 'Present' : 'Missing'}\n`);

  // Test 1: merchants-by-location endpoint
  console.log('📋 STEP 1: Testing /merchants-by-location endpoint...');
  try {
    const url = `${BASE_URL}/merchants-by-location?latitude=${testLat}&longitude=${testLng}&radius=${testRadius}&limit=10&offset=0`;
    console.log(`  Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`  Response Status: ${response.status} ${response.statusText}`);
    console.log(`  Response Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`  Response Body (first 500 chars): ${responseText.substring(0, 500)}...`);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ merchants-by-location endpoint SUCCESS');
      console.log(`  Found ${data.data?.merchants?.length || 0} merchants`);
      console.log(`  Total count: ${data.data?.totalCount || 0}`);
      
      if (data.data?.merchants?.length > 0) {
        console.log('  Sample merchant:');
        const merchant = data.data.merchants[0];
        console.log(`    - ${merchant.outletName || merchant.outlet_name}`);
        console.log(`    - Distance: ${merchant.distance || merchant.distanceMeters}m`);
        console.log(`    - Active: ${merchant.isActive || merchant.is_active}`);
      }
    } else {
      console.log('❌ merchants-by-location endpoint FAILED');
      console.log(`  Error: ${response.status} ${response.statusText}`);
      console.log(`  Response: ${responseText}`);
    }
  } catch (error) {
    console.log('❌ merchants-by-location endpoint ERROR');
    console.log(`  Error: ${error.message}`);
    console.log(`  Stack: ${error.stack}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 2: merchants-in-delivery-radius endpoint
  console.log('📋 STEP 2: Testing /merchants-in-delivery-radius endpoint...');
  try {
    const url = `${BASE_URL}/merchants-in-delivery-radius?latitude=${testLat}&longitude=${testLng}&limit=10&offset=0`;
    console.log(`  Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`  Response Status: ${response.status} ${response.statusText}`);
    console.log(`  Response Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`  Response Body (first 500 chars): ${responseText.substring(0, 500)}...`);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ merchants-in-delivery-radius endpoint SUCCESS');
      console.log(`  Found ${data.data?.merchants?.length || 0} merchants`);
      console.log(`  Total found: ${data.data?.totalFound || 0}`);
      
      if (data.data?.merchants?.length > 0) {
        console.log('  Sample merchant:');
        const merchant = data.data.merchants[0];
        console.log(`    - ${merchant.outletName || merchant.outlet_name}`);
        console.log(`    - Distance: ${merchant.distance || merchant.distanceMeters}m`);
        console.log(`    - Delivery radius: ${merchant.deliveryRadiusMeters || merchant.delivery_radius_meters}m`);
      }
    } else {
      console.log('❌ merchants-in-delivery-radius endpoint FAILED');
      console.log(`  Error: ${response.status} ${response.statusText}`);
      console.log(`  Response: ${responseText}`);
    }
  } catch (error) {
    console.log('❌ merchants-in-delivery-radius endpoint ERROR');
    console.log(`  Error: ${error.message}`);
    console.log(`  Stack: ${error.stack}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 3: Test with invalid parameters
  console.log('📋 STEP 3: Testing with invalid parameters...');
  try {
    const url = `${BASE_URL}/merchants-by-location?latitude=invalid&longitude=${testLng}&radius=${testRadius}`;
    console.log(`  Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`  Response Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`  Response Body: ${responseText}`);

    if (response.status === 400) {
      console.log('✅ Invalid parameter validation working correctly');
    } else {
      console.log('⚠️  Expected 400 status for invalid parameters');
    }
  } catch (error) {
    console.log('❌ Invalid parameter test ERROR');
    console.log(`  Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 4: Test without API key
  console.log('📋 STEP 4: Testing without API key...');
  try {
    const url = `${BASE_URL}/merchants-by-location?latitude=${testLat}&longitude=${testLng}&radius=${testRadius}`;
    console.log(`  Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`  Response Status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`  Response Body: ${responseText}`);

    if (response.status === 401 || response.status === 403) {
      console.log('✅ Authentication validation working correctly');
    } else {
      console.log('⚠️  Expected 401/403 status for missing API key');
    }
  } catch (error) {
    console.log('❌ Authentication test ERROR');
    console.log(`  Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 5: Test edge case coordinates
  console.log('📋 STEP 5: Testing edge case coordinates...');
  const edgeCases = [
    { name: 'Far coordinates', lat: 0, lng: 0 },
    { name: 'Boundary coordinates', lat: 90, lng: 180 },
    { name: 'Negative coordinates', lat: -14.0000, lng: -121.0000 },
  ];

  for (const testCase of edgeCases) {
    try {
      console.log(`  Testing ${testCase.name}: ${testCase.lat}, ${testCase.lng}`);
      const url = `${BASE_URL}/merchants-by-location?latitude=${testCase.lat}&longitude=${testCase.lng}&radius=${testRadius}&limit=5`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log(`    Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`    Found ${data.data?.merchants?.length || 0} merchants`);
      } else {
        const responseText = await response.text();
        console.log(`    Error: ${responseText.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
  }

  console.log('\n🎯 GEOSPATIAL ENDPOINT TEST SUMMARY:');
  console.log('✅ All endpoint tests completed');
  console.log('📊 Check individual test results above for detailed analysis');
  console.log('\n🎉 Systematic endpoint testing finished!');
}

testGeospatialEndpoints().catch(console.error);
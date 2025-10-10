import axios from 'axios';

// Customer address coordinates (TUP Manila Campus)
const customerCoordinates = {
  latitude: 14.5866,
  longitude: 120.9839
};

// API configuration
const API_BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Function to make API request with proper authentication
async function makeAPIRequest(endpoint, params = {}) {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    console.log(`🚀 Making request to: ${url.toString()}`);
    
    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': `users API-Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    return null;
  }
}

async function testMerchantsInDeliveryRadius() {
  console.log('🚚 Testing /merchants-in-delivery-radius endpoint');
  console.log('📍 Customer Location: College of Industrial Technology, TUP Manila Campus, Ayala Blvd, Ermita, Manila');
  console.log(`📍 Coordinates: ${customerCoordinates.latitude}, ${customerCoordinates.longitude}`);
  console.log('='.repeat(80));
  
  const response = await makeAPIRequest('/merchants-in-delivery-radius', {
    latitude: customerCoordinates.latitude,
    longitude: customerCoordinates.longitude
  });
  
  if (!response) {
    console.log('🚨 Request failed');
    return;
  }
  
  console.log('✅ Response received successfully!');
  console.log('📊 Response structure:', Object.keys(response));
  
  if (response.success && response.data && response.data.merchants) {
    const merchants = response.data.merchants;
    console.log(`\n🏪 Found ${merchants.length} merchants within delivery radius:`);
    
    merchants.forEach((merchant, index) => {
      const merchantLat = merchant.merchant_latitude || merchant.activeAddress?.latitude;
      const merchantLng = merchant.merchant_longitude || merchant.activeAddress?.longitude;
      
      let distance = 'Unknown';
      if (merchantLat && merchantLng) {
        distance = calculateDistance(
          customerCoordinates.latitude, 
          customerCoordinates.longitude,
          merchantLat, 
          merchantLng
        ).toFixed(2) + ' km';
      }
      
      console.log(`\n${index + 1}. ${merchant.outletName || 'Unknown Outlet'}`);
      console.log(`   📍 Location: ${merchantLat}, ${merchantLng}`);
      console.log(`   📏 Distance: ${distance}`);
      console.log(`   🚚 Delivery Time: ${merchant.estimatedDeliveryTime || 'Unknown'} minutes`);
      console.log(`   🟢 Status: ${merchant.operationalStatus || 'Unknown'}`);
      
      if (merchant.activeAddress) {
        console.log(`   🏠 Address: ${merchant.activeAddress.formatted_address || 'No address'}`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total merchants found: ${merchants.length}`);
    console.log(`   Customer location: TUP Manila Campus (${customerCoordinates.latitude}, ${customerCoordinates.longitude})`);
  } else {
    console.log('⚠️ Unexpected response format');
    console.log('📄 Full response:', JSON.stringify(response, null, 2));
  }
}

async function testMerchantsByLocation() {
  console.log('\n🔍 Testing /merchants-by-location endpoint (for comparison)');
  console.log('='.repeat(80));
  
  const response = await makeAPIRequest('/merchants-by-location', {
    latitude: customerCoordinates.latitude,
    longitude: customerCoordinates.longitude,
    radius: 50000 // 50km radius
  });
  
  if (!response) {
    console.log('🚨 Request failed');
    return;
  }
  
  console.log('✅ Response received successfully!');
  
  if (response.success && response.data && response.data.merchants) {
    const merchants = response.data.merchants;
    console.log(`\n🏪 Found ${merchants.length} merchants within 50km radius:`);
    
    merchants.forEach((merchant, index) => {
      const merchantLat = merchant.merchant_latitude || merchant.activeAddress?.latitude;
      const merchantLng = merchant.merchant_longitude || merchant.activeAddress?.longitude;
      
      let distance = 'Unknown';
      if (merchantLat && merchantLng) {
        distance = calculateDistance(
          customerCoordinates.latitude, 
          customerCoordinates.longitude,
          merchantLat, 
          merchantLng
        ).toFixed(2) + ' km';
      }
      
      console.log(`\n${index + 1}. ${merchant.outletName || 'Unknown Outlet'}`);
      console.log(`   📏 Distance: ${distance}`);
      console.log(`   🟢 Status: ${merchant.operationalStatus || 'Unknown'}`);
    });
  } else {
    console.log('⚠️ Unexpected response format');
    console.log('📄 Full response:', JSON.stringify(response, null, 2));
  }
}

async function main() {
  console.log('🧪 TESTING GEOSPATIAL ENDPOINTS');
  console.log('🎯 Goal: Find merchants that can deliver to TUP Manila Campus');
  console.log('');
  
  await testMerchantsInDeliveryRadius();
  await testMerchantsByLocation();
  
  console.log('\n✅ Testing completed!');
}

main().catch(console.error);
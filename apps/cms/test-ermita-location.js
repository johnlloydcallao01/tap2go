import axios from 'axios';

// SM City Manila, Ermita coordinates (based on Manila city center coordinates)
const CUSTOMER_LOCATION = {
  latitude: 14.599512,
  longitude: 120.984222,
  address: "Natividad Almeda-Lopez corner A. Villegas and San Marcelino St, Ermita, Manila (SM City Manila)"
};

// API Configuration
const API_BASE_URL = 'https://cms.tap2goph.com/api';
const API_KEY = '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// Generic API request function
async function makeAPIRequest(endpoint, params = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`\n🔍 Making request to: ${url}`);
    console.log(`📍 Parameters:`, params);
    
    const response = await axios.get(url, {
      params,
      headers: {
        'Authorization': `users API-Key ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Response Status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return null;
  }
}

// Test merchants in delivery radius
async function testMerchantsInDeliveryRadius() {
  console.log('\n🚚 === TESTING MERCHANTS IN DELIVERY RADIUS ===');
  console.log(`📍 Customer Location: ${CUSTOMER_LOCATION.address}`);
  console.log(`🌐 Coordinates: ${CUSTOMER_LOCATION.latitude}°N, ${CUSTOMER_LOCATION.longitude}°E`);
  
  const data = await makeAPIRequest('/merchants-in-delivery-radius', {
    latitude: CUSTOMER_LOCATION.latitude,
    longitude: CUSTOMER_LOCATION.longitude
  });
  
  if (data && data.docs) {
    console.log(`\n📊 Found ${data.docs.length} merchants within delivery radius:`);
    
    data.docs.forEach((merchant, index) => {
      const distance = calculateDistance(
        CUSTOMER_LOCATION.latitude,
        CUSTOMER_LOCATION.longitude,
        merchant.latitude,
        merchant.longitude
      );
      
      console.log(`\n🏪 ${index + 1}. ${merchant.name || 'Unnamed Merchant'}`);
      console.log(`   📍 Location: ${merchant.latitude}°N, ${merchant.longitude}°E`);
      console.log(`   📏 Distance: ${distance} km`);
      console.log(`   🚚 Delivery Time: ${merchant.estimatedDeliveryTime || 'N/A'} minutes`);
      console.log(`   🟢 Status: ${merchant.status || 'Unknown'}`);
      if (merchant.address) {
        console.log(`   🏠 Address: ${merchant.address.street || ''} ${merchant.address.barangay || ''} ${merchant.address.city || ''}`);
      }
    });
    
    console.log(`\n📈 Pagination: Page ${data.page || 1} of ${data.totalPages || 1}`);
    console.log(`📊 Total merchants: ${data.totalDocs || 0}`);
  } else {
    console.log('\n❌ No merchants found or API error occurred');
  }
  
  return data;
}

// Test merchants by location (broader search)
async function testMerchantsByLocation() {
  console.log('\n\n🌍 === TESTING MERCHANTS BY LOCATION (50KM RADIUS) ===');
  
  const data = await makeAPIRequest('/merchants-by-location', {
    latitude: CUSTOMER_LOCATION.latitude,
    longitude: CUSTOMER_LOCATION.longitude,
    radius: 50000 // 50km in meters
  });
  
  if (data && data.docs) {
    console.log(`\n📊 Found ${data.docs.length} merchants within 50km radius:`);
    
    data.docs.forEach((merchant, index) => {
      const distance = calculateDistance(
        CUSTOMER_LOCATION.latitude,
        CUSTOMER_LOCATION.longitude,
        merchant.latitude,
        merchant.longitude
      );
      
      console.log(`\n🏪 ${index + 1}. ${merchant.name || 'Unnamed Merchant'}`);
      console.log(`   📍 Location: ${merchant.latitude}°N, ${merchant.longitude}°E`);
      console.log(`   📏 Distance: ${distance} km`);
      console.log(`   🟢 Status: ${merchant.status || 'Unknown'}`);
      if (merchant.address) {
        console.log(`   🏠 Address: ${merchant.address.street || ''} ${merchant.address.barangay || ''} ${merchant.address.city || ''}`);
      }
    });
    
    console.log(`\n📈 Pagination: Page ${data.page || 1} of ${data.totalPages || 1}`);
    console.log(`📊 Total merchants: ${data.totalDocs || 0}`);
  } else {
    console.log('\n❌ No merchants found or API error occurred');
  }
  
  return data;
}

// Main execution
async function main() {
  console.log('🎯 === SM CITY MANILA, ERMITA MERCHANT SEARCH TEST ===');
  console.log(`🏠 Testing merchant availability for: ${CUSTOMER_LOCATION.address}`);
  console.log(`📍 Coordinates: ${CUSTOMER_LOCATION.latitude}°N, ${CUSTOMER_LOCATION.longitude}°E`);
  
  // Test delivery radius endpoint
  const deliveryData = await testMerchantsInDeliveryRadius();
  
  // Test location-based search
  const locationData = await testMerchantsByLocation();
  
  // Summary
  console.log('\n\n📋 === SUMMARY ===');
  const deliveryCount = deliveryData?.docs?.length || 0;
  const locationCount = locationData?.docs?.length || 0;
  
  console.log(`🚚 Merchants that can deliver: ${deliveryCount}`);
  console.log(`🌍 Merchants within 50km: ${locationCount}`);
  
  if (deliveryCount === 0 && locationCount === 0) {
    console.log('\n⚠️  No merchants found in this area.');
  } else if (deliveryCount === 0 && locationCount > 0) {
    console.log('\n⚠️  Merchants exist in the area but none offer delivery to this specific location.');
  } else {
    console.log('\n✅ Great! Merchants are available for delivery in this area.');
  }
  
  // Compare with previous TUP test location
  const tupDistance = calculateDistance(
    CUSTOMER_LOCATION.latitude,
    CUSTOMER_LOCATION.longitude,
    14.5866, // TUP Manila Campus latitude
    120.9839  // TUP Manila Campus longitude
  );
  
  console.log(`\n📏 Distance from TUP Manila Campus: ${tupDistance} km`);
  console.log('💡 This location is in the same general area as our previous successful test.');
}

// Run the test
main().catch(console.error);
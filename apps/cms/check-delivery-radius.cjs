require('dotenv').config();
const { Pool } = require('pg');

async function checkMerchantDeliveryRadius() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI
  });

  try {
    console.log('🔍 First checking merchants table structure...\n');
    
    // Check table structure first
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'merchants'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('📋 Merchants table columns:');
    structureResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('\n');
    
    console.log('🔍 Checking delivery radius of existing merchants...\n');
    
    const query = `
      SELECT 
        id,
        delivery_radius_meters,
        max_delivery_radius_meters,
        operational_status,
        merchant_latitude,
        merchant_longitude,
        created_at,
        is_active,
        is_accepting_orders
      FROM merchants 
      ORDER BY created_at DESC;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No merchants found in the database');
      return;
    }
    
    console.log(`📊 Found ${result.rows.length} merchants:\n`);
    
    // Group by delivery radius for summary
    const radiusGroups = {};
    
    result.rows.forEach((merchant, index) => {
      const radius = merchant.delivery_radius_meters;
      const maxRadius = merchant.max_delivery_radius_meters;
      if (!radiusGroups[radius]) {
        radiusGroups[radius] = [];
      }
      radiusGroups[radius].push(merchant);
      
      console.log(`${index + 1}. Merchant ID: ${merchant.id}`);
      console.log(`   📍 ID: ${merchant.id}`);
      console.log(`   🚚 Delivery Radius: ${radius ? (radius / 1000).toFixed(1) + ' km' : 'Not set'}`);
      console.log(`   🚚 Max Delivery Radius: ${maxRadius ? (maxRadius / 1000).toFixed(1) + ' km' : 'Not set'}`);
      console.log(`   📊 Status: ${merchant.operational_status || 'Not set'}`);
      console.log(`   ✅ Active: ${merchant.is_active ? 'Yes' : 'No'}`);
      console.log(`   📦 Accepting Orders: ${merchant.is_accepting_orders ? 'Yes' : 'No'}`);
      console.log(`   🌍 Coordinates: ${merchant.merchant_latitude ? merchant.merchant_latitude + ', ' + merchant.merchant_longitude : 'Not set'}`);
      console.log(`   📅 Created: ${merchant.created_at ? new Date(merchant.created_at).toLocaleDateString() : 'Unknown'}`);
      console.log('');
    });
    
    console.log('📈 DELIVERY RADIUS SUMMARY:');
    console.log('='.repeat(40));
    
    Object.keys(radiusGroups).sort((a, b) => {
      if (a === 'null') return 1;
      if (b === 'null') return -1;
      return parseFloat(a) - parseFloat(b);
    }).forEach(radius => {
      const merchants = radiusGroups[radius];
      const displayRadius = radius === 'null' ? 'Not Set' : (radius / 1000).toFixed(1) + ' km';
      console.log(`${displayRadius}: ${merchants.length} merchant(s)`);
      merchants.forEach(m => console.log(`  - Merchant ID: ${m.id}`));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking merchant delivery radius:', error.message);
  } finally {
    await pool.end();
  }
}

checkMerchantDeliveryRadius();
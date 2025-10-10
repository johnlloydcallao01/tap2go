require('dotenv').config();
const { Client } = require('pg');

async function testTriggerFunctionality() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // First, let's get a merchant and see their current data
    console.log('\n=== BEFORE UPDATE ===');
    const beforeUpdate = await client.query(`
      SELECT 
        m.id,
        m.active_address_id,
        m.merchant_latitude,
        m.merchant_longitude,
        a.latitude as address_latitude,
        a.longitude as address_longitude
      FROM merchants m
      LEFT JOIN addresses a ON m.active_address_id = a.id
      WHERE m.id = 8
      LIMIT 1;
    `);
    
    if (beforeUpdate.rows.length === 0) {
      console.log('No merchant found with ID 8');
      return;
    }

    const merchant = beforeUpdate.rows[0];
    console.log('Current merchant data:');
    console.log(`- Merchant ID: ${merchant.id}`);
    console.log(`- Active Address ID: ${merchant.active_address_id}`);
    console.log(`- Merchant Lat/Lng: ${merchant.merchant_latitude}, ${merchant.merchant_longitude}`);
    console.log(`- Address Lat/Lng: ${merchant.address_latitude}, ${merchant.address_longitude}`);

    // Find another address to switch to
    console.log('\n=== FINDING ALTERNATIVE ADDRESS ===');
    const alternativeAddress = await client.query(`
      SELECT id, latitude, longitude
      FROM addresses 
      WHERE id != $1 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      LIMIT 1;
    `, [merchant.active_address_id]);

    if (alternativeAddress.rows.length === 0) {
      console.log('No alternative address found');
      return;
    }

    const newAddress = alternativeAddress.rows[0];
    console.log('Alternative address found:');
    console.log(`- Address ID: ${newAddress.id}`);
    console.log(`- Address Lat/Lng: ${newAddress.latitude}, ${newAddress.longitude}`);

    // Update the merchant's active_address_id
    console.log('\n=== UPDATING MERCHANT ACTIVE_ADDRESS_ID ===');
    await client.query(`
      UPDATE merchants 
      SET active_address_id = $1
      WHERE id = $2;
    `, [newAddress.id, merchant.id]);

    console.log(`Updated merchant ${merchant.id} active_address_id to ${newAddress.id}`);

    // Check if the coordinates were updated by the trigger
    console.log('\n=== AFTER UPDATE ===');
    const afterUpdate = await client.query(`
      SELECT 
        m.id,
        m.active_address_id,
        m.merchant_latitude,
        m.merchant_longitude,
        a.latitude as address_latitude,
        a.longitude as address_longitude
      FROM merchants m
      LEFT JOIN addresses a ON m.active_address_id = a.id
      WHERE m.id = $1;
    `, [merchant.id]);

    const updatedMerchant = afterUpdate.rows[0];
    console.log('Updated merchant data:');
    console.log(`- Merchant ID: ${updatedMerchant.id}`);
    console.log(`- Active Address ID: ${updatedMerchant.active_address_id}`);
    console.log(`- Merchant Lat/Lng: ${updatedMerchant.merchant_latitude}, ${updatedMerchant.merchant_longitude}`);
    console.log(`- Address Lat/Lng: ${updatedMerchant.address_latitude}, ${updatedMerchant.address_longitude}`);

    // Check if the trigger worked
    const coordinatesMatch = (
      parseFloat(updatedMerchant.merchant_latitude) === parseFloat(updatedMerchant.address_latitude) &&
      parseFloat(updatedMerchant.merchant_longitude) === parseFloat(updatedMerchant.address_longitude)
    );

    console.log('\n=== TRIGGER TEST RESULT ===');
    if (coordinatesMatch) {
      console.log('✅ SUCCESS: Trigger is working! Merchant coordinates match address coordinates.');
    } else {
      console.log('❌ FAILURE: Trigger is NOT working. Merchant coordinates do not match address coordinates.');
      console.log(`Expected: ${updatedMerchant.address_latitude}, ${updatedMerchant.address_longitude}`);
      console.log(`Actual: ${updatedMerchant.merchant_latitude}, ${updatedMerchant.merchant_longitude}`);
    }

    // Restore original state
    console.log('\n=== RESTORING ORIGINAL STATE ===');
    await client.query(`
      UPDATE merchants 
      SET active_address_id = $1
      WHERE id = $2;
    `, [merchant.active_address_id, merchant.id]);
    console.log('Restored original active_address_id');

  } catch (error) {
    console.error('Error testing trigger functionality:', error);
  } finally {
    await client.end();
  }
}

testTriggerFunctionality();
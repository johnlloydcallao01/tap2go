require('dotenv').config();
const { Client } = require('pg');

async function verifySpecificMerchant() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get all merchants with their address information
    console.log('\n=== ALL MERCHANTS WITH ADDRESS INFO ===');
    const allMerchants = await client.query(`
      SELECT 
        m.id as merchant_id,
        m.active_address_id,
        m.merchant_latitude,
        m.merchant_longitude,
        a.latitude as address_latitude,
        a.longitude as address_longitude,
        CASE 
          WHEN m.merchant_latitude = a.latitude AND m.merchant_longitude = a.longitude 
          THEN '✅ SYNCED' 
          ELSE '❌ OUT OF SYNC' 
        END as sync_status
      FROM merchants m
      LEFT JOIN addresses a ON m.active_address_id = a.id
      ORDER BY m.id;
    `);
    
    console.log('All merchants and their sync status:');
    allMerchants.rows.forEach(row => {
      console.log(`Merchant ${row.merchant_id}: Address ${row.active_address_id} | Merchant: ${row.merchant_latitude},${row.merchant_longitude} | Address: ${row.address_latitude},${row.address_longitude} | ${row.sync_status}`);
    });

    // Check for any out-of-sync merchants
    const outOfSync = allMerchants.rows.filter(row => 
      row.merchant_latitude !== row.address_latitude || 
      row.merchant_longitude !== row.address_longitude
    );

    if (outOfSync.length > 0) {
      console.log('\n=== OUT OF SYNC MERCHANTS FOUND ===');
      console.log('The following merchants have coordinates that do not match their active address:');
      outOfSync.forEach(row => {
        console.log(`- Merchant ${row.merchant_id}: Expected ${row.address_latitude},${row.address_longitude} but has ${row.merchant_latitude},${row.merchant_longitude}`);
      });

      console.log('\n=== FIXING OUT OF SYNC MERCHANTS ===');
      for (const merchant of outOfSync) {
        await client.query(`
          UPDATE merchants 
          SET 
            merchant_latitude = $1,
            merchant_longitude = $2,
            updated_at = NOW()
          WHERE id = $3;
        `, [merchant.address_latitude, merchant.address_longitude, merchant.merchant_id]);
        
        console.log(`✅ Fixed merchant ${merchant.merchant_id} coordinates`);
      }
    } else {
      console.log('\n✅ ALL MERCHANTS ARE IN SYNC!');
    }

  } catch (error) {
    console.error('Error verifying merchants:', error);
  } finally {
    await client.end();
  }
}

verifySpecificMerchant();
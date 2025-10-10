const { Client } = require('pg')
require('dotenv').config()

async function testTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  })

  try {
    await client.connect()
    console.log('🔗 Connected to database')

    // First, let's check current merchant data
    console.log('\n📋 STEP 1: Current merchant data...')
    const merchantsResult = await client.query(`
      SELECT id, outlet_name, active_address_id, merchant_latitude, merchant_longitude 
      FROM merchants 
      ORDER BY id
    `)
    
    console.log('Current merchants:')
    merchantsResult.rows.forEach(merchant => {
      console.log(`  - ${merchant.outlet_name} (ID: ${merchant.id})`)
      console.log(`    Active Address ID: ${merchant.active_address_id}`)
      console.log(`    Coordinates: ${merchant.merchant_latitude}, ${merchant.merchant_longitude}`)
    })

    // Check available addresses
    console.log('\n📋 STEP 2: Available addresses...')
    const addressesResult = await client.query(`
      SELECT id, formatted_address, latitude, longitude 
      FROM addresses 
      ORDER BY id
    `)
    
    console.log('Available addresses:')
    addressesResult.rows.forEach(address => {
      console.log(`  - ${address.formatted_address} (ID: ${address.id})`)
      console.log(`    Coordinates: ${address.latitude}, ${address.longitude}`)
    })

    // Test 1: Update a merchant's active_address_id
    if (merchantsResult.rows.length > 0 && addressesResult.rows.length > 1) {
      const merchant = merchantsResult.rows[0]
      const currentAddressId = merchant.active_address_id
      
      // Find a different address to switch to
      const differentAddress = addressesResult.rows.find(addr => addr.id !== currentAddressId)
      
      if (differentAddress) {
        console.log(`\n🧪 TEST 1: Updating merchant "${merchant.outlet_name}" active_address_id...`)
        console.log(`  From address ID: ${currentAddressId}`)
        console.log(`  To address ID: ${differentAddress.id}`)
        console.log(`  Expected new coordinates: ${differentAddress.latitude}, ${differentAddress.longitude}`)

        // Update the merchant's active_address_id
        await client.query(`
          UPDATE merchants 
          SET active_address_id = $1 
          WHERE id = $2
        `, [differentAddress.id, merchant.id])

        // Check if coordinates were updated by the trigger
        const updatedMerchant = await client.query(`
          SELECT id, outlet_name, active_address_id, merchant_latitude, merchant_longitude 
          FROM merchants 
          WHERE id = $1
        `, [merchant.id])

        const updated = updatedMerchant.rows[0]
        console.log(`\n✅ RESULT: Merchant coordinates after trigger:`)
        console.log(`  Merchant: ${updated.outlet_name}`)
        console.log(`  Active Address ID: ${updated.active_address_id}`)
        console.log(`  Coordinates: ${updated.merchant_latitude}, ${updated.merchant_longitude}`)
        
        // Verify coordinates match the address
        if (updated.merchant_latitude == differentAddress.latitude && 
            updated.merchant_longitude == differentAddress.longitude) {
          console.log(`🎉 SUCCESS: Coordinates match the address! Trigger is working correctly.`)
        } else {
          console.log(`❌ FAILED: Coordinates don't match. Expected: ${differentAddress.latitude}, ${differentAddress.longitude}`)
        }

        // Test 2: Update address coordinates to test the address trigger
        console.log(`\n🧪 TEST 2: Updating address coordinates to test address trigger...`)
        const newLat = parseFloat(differentAddress.latitude) + 0.001
        const newLng = parseFloat(differentAddress.longitude) + 0.001
        
        console.log(`  Updating address ID ${differentAddress.id} coordinates`)
        console.log(`  From: ${differentAddress.latitude}, ${differentAddress.longitude}`)
        console.log(`  To: ${newLat}, ${newLng}`)

        await client.query(`
          UPDATE addresses 
          SET latitude = $1, longitude = $2 
          WHERE id = $3
        `, [newLat, newLng, differentAddress.id])

        // Check if merchant coordinates were updated
        const finalMerchant = await client.query(`
          SELECT id, outlet_name, active_address_id, merchant_latitude, merchant_longitude 
          FROM merchants 
          WHERE id = $1
        `, [merchant.id])

        const final = finalMerchant.rows[0]
        console.log(`\n✅ RESULT: Merchant coordinates after address update:`)
        console.log(`  Merchant: ${final.outlet_name}`)
        console.log(`  Coordinates: ${final.merchant_latitude}, ${final.merchant_longitude}`)
        
        if (final.merchant_latitude == newLat && final.merchant_longitude == newLng) {
          console.log(`🎉 SUCCESS: Address trigger is working! Merchant coordinates updated automatically.`)
        } else {
          console.log(`❌ FAILED: Address trigger not working. Expected: ${newLat}, ${newLng}`)
        }

        // Restore original coordinates
        console.log(`\n🔄 Restoring original address coordinates...`)
        await client.query(`
          UPDATE addresses 
          SET latitude = $1, longitude = $2 
          WHERE id = $3
        `, [differentAddress.latitude, differentAddress.longitude, differentAddress.id])

        // Restore original active_address_id
        console.log(`🔄 Restoring original active_address_id...`)
        await client.query(`
          UPDATE merchants 
          SET active_address_id = $1 
          WHERE id = $2
        `, [currentAddressId, merchant.id])

        console.log(`✅ Test completed and data restored.`)
      } else {
        console.log('❌ Cannot test: Need at least 2 addresses to test switching')
      }
    } else {
      console.log('❌ Cannot test: Need at least 1 merchant and 2 addresses')
    }

  } catch (error) {
    console.error('❌ Error testing triggers:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

testTriggers()
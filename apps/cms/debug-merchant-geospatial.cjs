const { getPayload } = require('payload')
require('dotenv').config()

async function debugMerchantGeospatial() {
  try {
    // Import the config dynamically
    const configModule = await import('./src/payload.config.ts')
    const config = configModule.default
    
    const payload = await getPayload({
      config: config,
    })

    console.log('🔍 Debugging Merchant Geospatial Data...\n')

    // Check merchants with their activeAddress
    const merchants = await payload.find({
      collection: 'merchants',
      depth: 2, // Populate activeAddress
      limit: 10,
    })

    console.log(`📊 Found ${merchants.totalDocs} merchants\n`)

    for (const merchant of merchants.docs) {
      console.log(`🏪 Merchant: ${merchant.outletName}`)
      console.log(`   ID: ${merchant.id}`)
      console.log(`   merchant_latitude: ${merchant.merchant_latitude}`)
      console.log(`   merchant_longitude: ${merchant.merchant_longitude}`)
      
      if (merchant.activeAddress) {
        const addressId = typeof merchant.activeAddress === 'object' 
          ? merchant.activeAddress.id 
          : merchant.activeAddress
        
        console.log(`   activeAddress ID: ${addressId}`)
        
        if (typeof merchant.activeAddress === 'object') {
          console.log(`   Address latitude: ${merchant.activeAddress.latitude}`)
          console.log(`   Address longitude: ${merchant.activeAddress.longitude}`)
        } else {
          // Fetch the address separately if not populated
          const address = await payload.findByID({
            collection: 'addresses',
            id: addressId,
          })
          console.log(`   Address latitude: ${address.latitude}`)
          console.log(`   Address longitude: ${address.longitude}`)
        }
      } else {
        console.log(`   ❌ No activeAddress set`)
      }
      console.log('   ---')
    }

    // Check a few addresses to verify they have coordinates
    console.log('\n📍 Checking Address Data...')
    const addresses = await payload.find({
      collection: 'addresses',
      limit: 5,
    })

    for (const address of addresses.docs) {
      console.log(`🏠 Address: ${address.street_address}`)
      console.log(`   ID: ${address.id}`)
      console.log(`   latitude: ${address.latitude}`)
      console.log(`   longitude: ${address.longitude}`)
      console.log('   ---')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugMerchantGeospatial()
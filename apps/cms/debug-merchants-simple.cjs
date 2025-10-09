const { Pool } = require('pg')
require('dotenv').config()

async function debugMerchantData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    console.log('🔍 Debugging Merchant Geospatial Data...\n')

    // Check merchants table structure
    console.log('📊 Checking merchants table structure...')
    const merchantColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'merchants' 
      AND column_name IN ('merchant_latitude', 'merchant_longitude', 'active_address_id')
      ORDER BY column_name;
    `)
    
    console.log('Merchant columns:')
    merchantColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    })
    console.log()

    // Check merchants with their geospatial data
    console.log('🏪 Checking merchant records...')
    const merchants = await pool.query(`
      SELECT 
        id, 
        outlet_name, 
        merchant_latitude, 
        merchant_longitude, 
        active_address_id
      FROM merchants 
      LIMIT 10;
    `)

    console.log(`Found ${merchants.rows.length} merchants:`)
    for (const merchant of merchants.rows) {
      console.log(`  🏪 ${merchant.outlet_name}`)
      console.log(`     ID: ${merchant.id}`)
      console.log(`     merchant_latitude: ${merchant.merchant_latitude}`)
      console.log(`     merchant_longitude: ${merchant.merchant_longitude}`)
      console.log(`     active_address_id: ${merchant.active_address_id}`)
      
      if (merchant.active_address_id) {
        // Get the corresponding address
        const address = await pool.query(`
          SELECT id, latitude, longitude, formatted_address
          FROM addresses 
          WHERE id = $1;
        `, [merchant.active_address_id])
        
        if (address.rows.length > 0) {
          const addr = address.rows[0]
          console.log(`     📍 Address: ${addr.formatted_address}`)
          console.log(`        latitude: ${addr.latitude}`)
          console.log(`        longitude: ${addr.longitude}`)
        } else {
          console.log(`     ❌ Address not found for ID: ${merchant.active_address_id}`)
        }
      }
      console.log('     ---')
    }

    // Check addresses table
    console.log('\n📍 Checking addresses table...')
    const addresses = await pool.query(`
      SELECT id, formatted_address, latitude, longitude
      FROM addresses 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      LIMIT 5;
    `)

    console.log(`Found ${addresses.rows.length} addresses with coordinates:`)
    addresses.rows.forEach(addr => {
      console.log(`  🏠 ${addr.formatted_address}`)
      console.log(`     ID: ${addr.id}`)
      console.log(`     latitude: ${addr.latitude}`)
      console.log(`     longitude: ${addr.longitude}`)
      console.log('     ---')
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

debugMerchantData()
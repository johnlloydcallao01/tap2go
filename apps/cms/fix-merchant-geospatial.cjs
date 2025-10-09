const { Pool } = require('pg')
require('dotenv').config()

async function fixMerchantGeospatial() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URI
  })

  try {
    console.log('🔧 Fixing merchant geospatial data...')

    // Get all merchants with active_address_id but null geospatial data
    const merchants = await pool.query(`
      SELECT id, outlet_name, active_address_id, merchant_latitude, merchant_longitude
      FROM merchants 
      WHERE active_address_id IS NOT NULL 
        AND (merchant_latitude IS NULL OR merchant_longitude IS NULL);
    `)

    console.log(`Found ${merchants.rows.length} merchants needing geospatial data update:`)

    for (const merchant of merchants.rows) {
      console.log(`\n🏪 Processing: ${merchant.outlet_name} (ID: ${merchant.id})`)
      console.log(`   Active Address ID: ${merchant.active_address_id}`)

      // Get the address coordinates
      const address = await pool.query(`
        SELECT id, latitude, longitude, formatted_address
        FROM addresses 
        WHERE id = $1;
      `, [merchant.active_address_id])

      if (address.rows.length > 0) {
        const addr = address.rows[0]
        console.log(`   📍 Address: ${addr.formatted_address}`)
        console.log(`   Coordinates: ${addr.latitude}, ${addr.longitude}`)

        if (addr.latitude && addr.longitude) {
          // Update merchant with geospatial data
          await pool.query(`
            UPDATE merchants 
            SET merchant_latitude = $1, merchant_longitude = $2
            WHERE id = $3;
          `, [addr.latitude, addr.longitude, merchant.id])

          console.log(`   ✅ Updated merchant geospatial data`)
        } else {
          console.log(`   ⚠️  Address has no coordinates`)
        }
      } else {
        console.log(`   ❌ Address not found`)
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const updated = await pool.query(`
      SELECT id, outlet_name, merchant_latitude, merchant_longitude
      FROM merchants 
      WHERE merchant_latitude IS NOT NULL AND merchant_longitude IS NOT NULL;
    `)

    console.log(`\n✅ Successfully updated ${updated.rows.length} merchants with geospatial data:`)
    updated.rows.forEach(merchant => {
      console.log(`  🏪 ${merchant.outlet_name}: ${merchant.merchant_latitude}, ${merchant.merchant_longitude}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

fixMerchantGeospatial()
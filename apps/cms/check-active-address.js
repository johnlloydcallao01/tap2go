import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkActiveAddresses() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if customers table exists and has active_address_id column
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'active_address_id'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ active_address_id column exists in customers table');
      console.log('Column info:', tableCheck.rows[0]);
      
      // Check current data in customers table
      const dataCheck = await client.query(`
        SELECT id, user_id, active_address_id, srn 
        FROM customers 
        ORDER BY id
      `);
      
      console.log('\n📊 Current customers data:');
      console.log('Total customers:', dataCheck.rows.length);
      
      if (dataCheck.rows.length > 0) {
        console.log('\nCustomers with active addresses:');
        dataCheck.rows.forEach(row => {
          console.log(`Customer ID: ${row.id}, User ID: ${row.user_id}, SRN: ${row.srn}, Active Address ID: ${row.active_address_id || 'NULL'}`);
        });
        
        const withActiveAddress = dataCheck.rows.filter(row => row.active_address_id !== null);
        console.log(`\n📈 Summary: ${withActiveAddress.length} out of ${dataCheck.rows.length} customers have active addresses`);
        
        // If there are active addresses, get the address details
        if (withActiveAddress.length > 0) {
          console.log('\n🏠 Active address details:');
          for (const customer of withActiveAddress) {
            const addressQuery = await client.query(`
              SELECT id, formatted_address, address_type, locality, is_default
              FROM addresses 
              WHERE id = $1
            `, [customer.active_address_id]);
            
            if (addressQuery.rows.length > 0) {
              const address = addressQuery.rows[0];
              console.log(`Customer ${customer.id}: ${address.formatted_address} (${address.address_type})`);
            }
          }
        }
      } else {
        console.log('No customers found in the table');
      }
    } else {
      console.log('❌ active_address_id column not found in customers table');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkActiveAddresses();
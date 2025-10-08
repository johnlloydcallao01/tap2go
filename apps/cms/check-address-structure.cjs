const { Client } = require('pg');

async function checkAddressTable() {
  const client = new Client({ 
    connectionString: process.env.DATABASE_URI 
  });
  
  try {
    await client.connect();
    console.log('📋 ADDRESSES TABLE STRUCTURE:');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'addresses' 
      ORDER BY ordinal_position;
    `);
    
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n📊 SAMPLE ADDRESS DATA:');
    const sampleData = await client.query('SELECT * FROM addresses LIMIT 3');
    console.log(sampleData.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAddressTable();
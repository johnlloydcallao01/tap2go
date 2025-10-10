require('dotenv').config();
const { Client } = require('pg');

async function checkExistingTriggers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get detailed trigger information
    console.log('\n=== DETAILED TRIGGER INFORMATION ===');
    const triggerDetails = await client.query(`
      SELECT 
        t.trigger_name,
        t.event_manipulation,
        t.event_object_table,
        t.action_timing,
        t.action_condition,
        t.action_statement,
        p.prosrc as function_source
      FROM information_schema.triggers t
      LEFT JOIN pg_proc p ON p.proname = REPLACE(REPLACE(t.action_statement, 'EXECUTE FUNCTION ', ''), '()', '')
      WHERE t.event_object_table IN ('merchants', 'addresses')
      ORDER BY t.event_object_table, t.trigger_name;
    `);
    
    console.log('Detailed trigger information:');
    triggerDetails.rows.forEach(row => {
      console.log(`\n--- ${row.trigger_name} ---`);
      console.log(`Table: ${row.event_object_table}`);
      console.log(`Event: ${row.action_timing} ${row.event_manipulation}`);
      console.log(`Action: ${row.action_statement}`);
      if (row.action_condition) {
        console.log(`Condition: ${row.action_condition}`);
      }
      if (row.function_source) {
        console.log(`Function Source: ${row.function_source}`);
      }
    });

    // Get trigger functions from pg_proc
    console.log('\n=== TRIGGER FUNCTIONS ===');
    const triggerFunctions = await client.query(`
      SELECT 
        p.proname as function_name,
        p.prosrc as function_source,
        p.prolang,
        l.lanname as language_name
      FROM pg_proc p
      JOIN pg_language l ON p.prolang = l.oid
      WHERE p.proname LIKE '%trigger%' 
        OR p.proname LIKE '%merchant%' 
        OR p.proname LIKE '%address%'
      ORDER BY p.proname;
    `);
    
    console.log('Trigger functions found:');
    triggerFunctions.rows.forEach(row => {
      console.log(`\n--- ${row.function_name} (${row.language_name}) ---`);
      console.log(row.function_source);
    });

  } catch (error) {
    console.error('Error checking existing triggers:', error);
  } finally {
    await client.end();
  }
}

checkExistingTriggers();
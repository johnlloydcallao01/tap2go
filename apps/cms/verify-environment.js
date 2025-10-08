import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

async function verifyEnvironment() {
  console.log('🔧 VERIFYING ENVIRONMENT VARIABLES AND DATABASE URI...\n');

  // Check critical environment variables
  console.log('📋 STEP 1: Checking environment variables...');
  const requiredVars = [
    'DATABASE_URI',
    'PAYLOAD_SECRET_KEY',
    'PAYLOAD_SECRET',
    'NODE_ENV'
  ];

  const optionalVars = [
    'PORT',
    'PAYLOAD_PUBLIC_SERVER_URL',
    'NEXT_PUBLIC_SERVER_URL'
  ];

  console.log('Required environment variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values
      const maskedValue = varName.includes('SECRET') || varName.includes('URI') 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
        : value;
      console.log(`  ✅ ${varName}: ${maskedValue}`);
    } else {
      console.log(`  ❌ ${varName}: NOT SET`);
    }
  });

  console.log('\nOptional environment variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${value}`);
    } else {
      console.log(`  ⚠️  ${varName}: NOT SET`);
    }
  });

  // Test database URI format
  console.log('\n📋 STEP 2: Validating DATABASE_URI format...');
  const databaseUri = process.env.DATABASE_URI;
  
  if (!databaseUri) {
    console.log('❌ DATABASE_URI is not set');
    return;
  }

  try {
    const url = new URL(databaseUri);
    console.log('✅ DATABASE_URI format is valid');
    console.log(`  Protocol: ${url.protocol}`);
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port || 'default'}`);
    console.log(`  Database: ${url.pathname.substring(1)}`);
    console.log(`  Username: ${url.username || 'not specified'}`);
    console.log(`  Password: ${url.password ? 'present' : 'not specified'}`);
    
    // Check for SSL parameters
    const sslMode = url.searchParams.get('sslmode');
    console.log(`  SSL Mode: ${sslMode || 'not specified'}`);
    
  } catch (error) {
    console.log('❌ DATABASE_URI format is invalid');
    console.log(`  Error: ${error.message}`);
    return;
  }

  // Test database connection
  console.log('\n📋 STEP 3: Testing database connection...');
  const pool = new Pool({
    connectionString: databaseUri,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log(`  Current time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
    
    // Test PostGIS availability
    try {
      const postgisResult = await client.query('SELECT PostGIS_Version() as postgis_version');
      console.log(`  PostGIS version: ${postgisResult.rows[0].postgis_version}`);
    } catch (postgisError) {
      console.log('  ⚠️  PostGIS not available or not installed');
    }
    
    // Test merchants table access
    try {
      const merchantsResult = await client.query('SELECT COUNT(*) as merchant_count FROM merchants');
      console.log(`  Merchants table access: ✅ (${merchantsResult.rows[0].merchant_count} records)`);
    } catch (merchantsError) {
      console.log(`  Merchants table access: ❌ (${merchantsError.message})`);
    }
    
    client.release();
    
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log(`  Error: ${error.message}`);
    console.log(`  Code: ${error.code}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('  💡 Suggestion: Check if the database host is reachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('  💡 Suggestion: Check if the database server is running and port is correct');
    } else if (error.code === '28P01') {
      console.log('  💡 Suggestion: Check database credentials (username/password)');
    } else if (error.code === '3D000') {
      console.log('  💡 Suggestion: Check if the database name exists');
    }
  } finally {
    await pool.end();
  }

  // Check PayloadCMS configuration
  console.log('\n📋 STEP 4: Checking PayloadCMS configuration...');
  
  const payloadSecret = process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET_KEY;
  if (payloadSecret) {
    console.log(`✅ PayloadCMS secret: present (${payloadSecret.length} characters)`);
    
    if (payloadSecret.length < 32) {
      console.log('  ⚠️  Warning: PayloadCMS secret should be at least 32 characters for security');
    }
  } else {
    console.log('❌ PayloadCMS secret: missing');
  }

  const nodeEnv = process.env.NODE_ENV;
  console.log(`✅ Node environment: ${nodeEnv || 'not set'}`);
  
  if (nodeEnv === 'production') {
    console.log('  🔒 Production mode: Enhanced security and error handling');
  } else {
    console.log('  🔧 Development mode: Detailed error messages and debugging');
  }

  // Check server URL configuration
  console.log('\n📋 STEP 5: Checking server URL configuration...');
  
  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl) {
    console.log(`✅ Server URL: ${serverUrl}`);
    
    try {
      const url = new URL(serverUrl);
      console.log(`  Protocol: ${url.protocol}`);
      console.log(`  Host: ${url.hostname}`);
      console.log(`  Port: ${url.port || 'default'}`);
    } catch (error) {
      console.log(`  ⚠️  Server URL format may be invalid: ${error.message}`);
    }
  } else {
    console.log('⚠️  Server URL: not set (may cause issues with absolute URLs)');
  }

  console.log('\n🎯 ENVIRONMENT VERIFICATION SUMMARY:');
  console.log('✅ Environment variable check completed');
  console.log('✅ Database URI validation completed');
  console.log('✅ Database connection test completed');
  console.log('✅ PayloadCMS configuration check completed');
  console.log('✅ Server URL configuration check completed');
  console.log('\n🎉 Environment verification finished!');
}

verifyEnvironment().catch(console.error);